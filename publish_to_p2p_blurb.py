#!/usr/bin/env python

import p2p

from clint.textui import colored
from tarbell.contextmanagers import ensure_settings, ensure_project
from tarbell.utils import puts

ROOT_URL = 'graphics.chicagotribune.com/cafo_pollution'

def render_chart_embed(template_filename, site):
    env = site.app.jinja_env
    context = site.get_context()
    template = env.get_template(template_filename)
    context.update({
        'ROOT_URL': ROOT_URL,
    })
    return template.render(context)

def get_chart_blurb_content_item(p2p_slug, title, template_filename, site):
    content_item = {
        'slug': p2p_slug,
        'content_item_type_code': 'blurb',
        'title': title,
        'body': render_chart_embed(template_filename, site),
    }
    return content_item


def p2p_publish_chart_blurb(p2p_slug, title, template_filename, site, debug=False):
    content_item = get_chart_blurb_content_item(p2p_slug, title,
        template_filename, site)

    if debug:
        import pprint
        pprint.pprint(content_item)

   
    if debug is False:
        p2p_conn = p2p.get_connection()
        try:
            created, response = p2p_conn.create_or_update_content_item(content_item)
        except Exception as e:
            print(e)
            created = True

        if created:
            # If we just created the item, set its state to 'working'
            try:
                p2p_conn.update_content_item({
                    'slug': content_item['slug'],
                    'content_item_state_code': 'working',
                })
            except Exception as e:
                print(e)
                pass

    puts("\n" + colored.green("Published to P2P with slug {}".format(content_item['slug'])))
       

class MockCommand(object):
    name = "mock"

if __name__ == "__main__":
    mock_command = MockCommand()
    args = []
    with ensure_settings(mock_command, args) as settings, ensure_project(mock_command, args) as site:
        context = site.get_context(publish=True)
        charts = [
            (context['blurb_p2p_slug'], "{} (promo)".format(context['seotitle']), '_promo.html'),
        ]
        for p2p_slug, title, template_filename in charts: 
            p2p_publish_chart_blurb(p2p_slug, title, template_filename, site,
                debug=False)
