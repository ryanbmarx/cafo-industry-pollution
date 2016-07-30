# -*- coding: utf-8 -*-
# SPREADSHEET_KEY = "1XBlAN9Kcfogf5NgiPZhmr8f63uKZS_zmfyHQYCW_b68"

"""
Tarbell project configuration
"""

import functools
  
from clint.textui import colored
from flask import Blueprint, g, render_template
import ftfy
import jinja2
import json
from markdown import markdown
import p2p
from simplejson.scanner import JSONDecodeError
from tarbell.utils import puts

from tarbell.hooks import register_hook

import datetime

blueprint = Blueprint('cafo_pollution', __name__)

# Custom routes
@blueprint.route('/blurbs/<p2p_slug>.html')
def preview_blurb(p2p_slug):
        site = g.current_site
        context = site.get_context()
  
        blurb = next(b for b in context['blurbs'] if b['p2p_slug'] == p2p_slug)
        return render_template(blurb['template'], blurb=blurb, **context)
  
def is_production_bucket(bucket_url, buckets):
    for name, url in buckets.items():
        if url == bucket_url and name == 'production':
            return True
    return False
  
def render_site_template(template_name, site, **extra_context):
    template = site.app.jinja_env.get_template(template_name)
    context = site.get_context(publish=True)
    context.update(extra_context)
    rendered = template.render(**context)
  
    if u'“' in rendered or u'”' in rendered:
        # HACK: Work around P2P API's weird handling of curly quotes where it
        # converts the first set to HTML entities and converts the rest to
        # upside down quotes
        msg = ("Removing curly quotes because it appears that the P2P API does "
               "not handle them correctly.")
        puts("\n" + colored.red(msg))
        rendered = ftfy.fix_text(rendered, uncurl_quotes=True)
  
    return rendered
  
def p2p_publish_blurb(site, s3):
    """Render each template in the `blurbs` worksheet and publish to P2P"""
  
    if not is_production_bucket(s3.bucket, site.project.S3_BUCKETS):
        puts(colored.red(
            "\nNot publishing to production bucket. Skipping P2P publiction."))
        return
  
    context = site.get_context(publish=True)
  
    p2p_conn = p2p.get_connection()
  
    for blurb in context['blurbs']:
        extra_context = {
            'blurb': blurb,
        }
  
  
        content = render_site_template(blurb['template'], site, **extra_context)
  
        content_item = {
            'slug': blurb['p2p_slug'],
            'content_item_type_code': 'blurb',
            'title': blurb['title'],
            'body': content,
            'seo_keyphrase': blurb['keywords'],
        }
        try:
            created, response = p2p_conn.create_or_update_content_item(content_item)
            if created:
                # If we just created the item, set its state to 'working'
                p2p_conn.update_content_item({
                    'slug': blurb['p2p_slug'],
                    'content_item_state_code': 'working',
                })
        except JSONDecodeError:
            # HACK: Something is borked with either python-p2p or the P2P content services
            # API itself. It's ok to ignore this error
            print('JSONDecodeError!')
  
        puts("\n" + colored.green("Published to P2P with slug {}".format(blurb['p2p_slug'])))
  
def _get_published_content(site, s3):
    template = site.app.jinja_env.get_template('_htmlstory.html')
    context = site.get_context(publish=True)

    rendered = template.render(**context)
  
    if u'“' in rendered or u'”' in rendered:
        # HACK: Work around P2P API's weird handling of curly quotes where it
        # converts the first set to HTML entities and converts the rest to
        # upside down quotes
        msg = ("Removing curly quotes because it appears that the P2P API does "
               "not handle them correctly.")
        puts("\n" + colored.red(msg))
        rendered = ftfy.fix_text(rendered, uncurl_quotes=True)
  
    return rendered
  
def p2p_publish_htmlstory(site, s3):
    if not is_production_bucket(s3.bucket, site.project.S3_BUCKETS):
        puts(colored.red(
            "\nNot publishing to production bucket. Skipping P2P publiction."))
        return
  
    content = _get_published_content(site, s3)
    context = site.get_context(publish=True)
  
    try:
        p2p_slug = context['p2p_slug']
    except KeyError:
        puts("No p2p_slug defined in the spreadsheet or DEFAULT_CONTEXT. "
             "Skipping P2P publication.")
        return
  
    try:
        title = context['headline']
    except KeyError:
        title = context['title']
    p2p_conn = p2p.get_connection()
    content_item = {
        'slug': p2p_slug,
        'content_item_type_code': 'htmlstory',
        'title': title,
        'body': content,
        'seotitle': context['seotitle'],
        'seodescription': context['seodescription'],
        'seo_keyphrase': context['keywords'],
        'byline': context['byline'],
        'custom_param_data': {
            'story-summary': markdown(context['story_summary']),
        },
    }
  
    created = False
    try:
        created, response = p2p_conn.create_or_update_content_item(content_item)
    except JSONDecodeError:
        # HACK: Something is borked with either python-p2p or the P2P content services
        # API itself. It's ok to ignore this error
        print('JSONDecodeError!')
  
    if created:
        try:
            # If we just created the item, set its state to 'working'
            p2p_conn.update_content_item({
                'slug': p2p_slug,
                'content_item_state_code': 'working',
                'kicker_id': 'Data',
            })
        except JSONDecodeError:
            # HACK: Something is borked with either python-p2p or the P2P content services
            # API itself. It's ok to ignore this error
            print('JSONDecodeError!')
  
    puts("\n" + colored.green("Published to P2P with slug {}".format(p2p_slug)))
  
def p2p_publish_blurb_and_htmlstory(site, s3):
    p2p_publish_htmlstory(site, s3)
    p2p_publish_blurb(site, s3)
  
P2P_PUBLISH_HOOK = p2p_publish_blurb_and_htmlstory


######################
#BEGIN PROJECT THINGYS
######################

def has_coordinates(event):
    return ('lat' in event and event['lat'] and 
            'lng' in event and event['lng'])

def filter_pollution_events(events):
    return [e for e in events
            if has_coordinates(e)]

@blueprint.route('/data/pollution-events.json')
def pollution_events_json():
    site = g.current_site
    
    #This is site data
    context = site.get_context()
    data = filter_pollution_events(context['profiles'][1:])
    print len(data)
    return json.dumps(data)

def json_generator():
    yield '/data/pollution-events.json'

@register_hook('generate')
def register_json(site, output_root, extra_context):
    site.freezer.register_generator(json_generator)

@blueprint.app_template_filter('xldate_to_datetime')
def xldate_to_datetime(xldate):
    temp = datetime.datetime(1900, 1, 1)
    delta = datetime.timedelta(days=xldate)
    retval = temp+delta
    return retval.strftime("%B %-d, %Y")

# Google spreadsheet key
SPREADSHEET_KEY = "1XBlAN9Kcfogf5NgiPZhmr8f63uKZS_zmfyHQYCW_b68"

# Exclude these files from publication
EXCLUDES = ['*.md', 'requirements.txt', 'node_modules', 'sass', 'js/src', 'package.json', 'Gruntfile.js']

# Spreadsheet cache lifetime in seconds. (Default: 4)
# SPREADSHEET_CACHE_TTL = 4

# Create JSON data at ./data.json, disabled by default
CREATE_JSON = True

# Get context from a local file or URL. This file can be a CSV or Excel
# spreadsheet file. Relative, absolute, and remote (http/https) paths can be 
# used.
# CONTEXT_SOURCE_FILE = ""

# EXPERIMENTAL: Path to a credentials file to authenticate with Google Drive.
# This is useful for for automated deployment. This option may be replaced by
# command line flag or environment variable. Take care not to commit or publish
# your credentials file.
# CREDENTIALS_PATH = ""

# S3 bucket configuration
S3_BUCKETS = {
    # Provide target -> s3 url pairs, such as:
    #     "mytarget": "mys3url.bucket.url/some/path"
    # then use tarbell publish mytarget to publish to it
    
    "production": "graphics.chicagotribune.com/cafo_pollution",
    "staging": "apps.beta.tribapps.com/cafo/cafo_pollution"
}

# Default template variables
DEFAULT_CONTEXT = {
    'data': {   'another_key': {   'description': u'This is another description.',
                                   'key': u'another_key'},
                'example_key': {   'description': u'This is a description of a key.',
                                   'key': u'example_key'}},
    'example_key': u'This is an example of a template variable provided by the google spreadsheet',
    'name': 'cafo_pollution',
    'title': 'CAFO pollution'
}