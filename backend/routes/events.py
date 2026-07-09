import os
import requests
from flask import Blueprint, request, jsonify

events_bp = Blueprint('events', __name__)

TM_API_KEY = os.environ.get('TM_API_KEY', '')
TM_BASE = 'https://app.ticketmaster.com/discovery/v2'


def get_best_image(images):
    """Get best quality image from TM image array."""
    if not images:
        return ''
    # Prefer 16_9 ratio at high resolution
    for ratio in ['16_9', '3_2', '4_3']:
        candidates = [img for img in images if img.get('ratio') == ratio]
        if candidates:
            best = max(candidates, key=lambda x: x.get('width', 0))
            return best.get('url', '')
    return images[0].get('url', '')

@events_bp.route('/events/search')
def search_events():
    q = request.args.get('q', '')
    size = request.args.get('size', 20)

    city = request.args.get('city', '')
    start_date = request.args.get('startDateTime', '')
    end_date = request.args.get('endDateTime', '')

    if not TM_API_KEY:
        return jsonify({'error': 'TM_API_KEY not configured', 'events': []}), 200

    try:
        params = {
            'apikey': TM_API_KEY,
            'keyword': q,
            'size': size,
            'sort': 'relevance,desc',
            'locale': '*',
        }

        # Add filters only when provided
        if city:
            params['city'] = city

        if start_date:
            params['startDateTime'] = start_date

        if end_date:
            params['endDateTime'] = end_date


        resp = requests.get(
            f'{TM_BASE}/events.json',
            params=params,
            timeout=10
        )

        resp.raise_for_status()
        data = resp.json()

        events_raw = data.get('_embedded', {}).get('events', [])
        events = []

        for ev in events_raw:
            images = ev.get('images', [])
            image_url = get_best_image(images)

            venues = ev.get('_embedded', {}).get('venues', [])
            venue = venues[0] if venues else {}

            venue_name = venue.get('name', '')
            city_name = venue.get('city', {}).get('name', '')
            state = venue.get('state', {}).get('stateCode', '')

            dates = ev.get('dates', {})
            start = dates.get('start', {})

            events.append({
                'id': ev.get('id', ''),
                'name': ev.get('name', ''),
                'image': image_url,
                'venue': venue_name,
                'city': city_name,
                'state': state,
                'date': start.get('localDate', ''),
                'time': start.get('localTime', ''),
                'url': ev.get('url', ''),
            })

        return jsonify({'events': events})

    except requests.RequestException as e:
        return jsonify({'error': str(e), 'events': []}), 200