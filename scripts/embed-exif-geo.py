#!/usr/bin/env python3
"""
EXIF Geolocation Embedding Script
Embeds GPS coordinates and location metadata into image files for SEO and AI discovery.
"""

import os
import sys
from PIL import Image
import piexif
from decimal import Decimal
from typing import Dict, Tuple, Optional

# Costa del Sol default coordinates
DEFAULT_COORDS = {
    'latitude': 36.5100,
    'longitude': -4.8826,  # Note: West is negative
    'location_name': 'Costa del Sol, Málaga, Spain'
}

# Common locations in Costa del Sol
LOCATIONS = {
    'marbella': {
        'latitude': 36.5100,
        'longitude': -4.8826,
        'location_name': 'Marbella, Costa del Sol, Spain'
    },
    'estepona': {
        'latitude': 36.4277,
        'longitude': -5.1448,
        'location_name': 'Estepona, Costa del Sol, Spain'
    },
    'malaga': {
        'latitude': 36.7213,
        'longitude': -4.4214,
        'location_name': 'Málaga, Costa del Sol, Spain'
    },
    'benalmadena': {
        'latitude': 36.5988,
        'longitude': -4.5162,
        'location_name': 'Benalmádena, Costa del Sol, Spain'
    },
    'fuengirola': {
        'latitude': 36.5406,
        'longitude': -4.6269,
        'location_name': 'Fuengirola, Costa del Sol, Spain'
    },
    'torremolinos': {
        'latitude': 36.6204,
        'longitude': -4.4999,
        'location_name': 'Torremolinos, Costa del Sol, Spain'
    }
}


def decimal_to_dms(decimal_degree: float) -> Tuple[int, int, int]:
    """
    Convert decimal degrees to degrees, minutes, seconds format for EXIF.
    
    Args:
        decimal_degree: Decimal degree value
        
    Returns:
        Tuple of (degrees, minutes, seconds)
    """
    degrees = int(abs(decimal_degree))
    minutes_decimal = (abs(decimal_degree) - degrees) * 60
    minutes = int(minutes_decimal)
    seconds = int((minutes_decimal - minutes) * 60 * 100)  # Multiply by 100 for precision
    
    return (degrees, 1), (minutes, 1), (seconds, 100)


def embed_exif_geo(
    image_path: str,
    output_path: Optional[str] = None,
    latitude: Optional[float] = None,
    longitude: Optional[float] = None,
    location_name: Optional[str] = None,
    location_key: Optional[str] = None
) -> str:
    """
    Embed GPS coordinates and location name into image EXIF data.
    
    Args:
        image_path: Path to input image
        output_path: Path to save output image (default: overwrite input)
        latitude: Latitude in decimal degrees
        longitude: Longitude in decimal degrees (West is negative)
        location_name: Human-readable location name
        location_key: Key for predefined location (e.g., 'marbella')
        
    Returns:
        Path to output image
    """
    # Use predefined location if key provided
    if location_key and location_key.lower() in LOCATIONS:
        loc = LOCATIONS[location_key.lower()]
        latitude = loc['latitude']
        longitude = loc['longitude']
        location_name = loc['location_name']
    
    # Use defaults if not provided
    if latitude is None:
        latitude = DEFAULT_COORDS['latitude']
    if longitude is None:
        longitude = DEFAULT_COORDS['longitude']
    if location_name is None:
        location_name = DEFAULT_COORDS['location_name']
    
    # Determine output path
    if output_path is None:
        output_path = image_path
    
    # Load image
    img = Image.open(image_path)
    
    # Load existing EXIF data or create new
    try:
        exif_dict = piexif.load(img.info.get('exif', b''))
    except:
        exif_dict = {'0th': {}, 'Exif': {}, 'GPS': {}, '1st': {}, 'thumbnail': None}
    
    # Convert coordinates to DMS format
    lat_dms = decimal_to_dms(latitude)
    lon_dms = decimal_to_dms(abs(longitude))  # Use absolute value for DMS
    
    # Set GPS reference (N/S and E/W)
    lat_ref = 'N' if latitude >= 0 else 'S'
    lon_ref = 'E' if longitude >= 0 else 'W'
    
    # Build GPS IFD
    gps_ifd = {
        piexif.GPSIFD.GPSLatitudeRef: lat_ref,
        piexif.GPSIFD.GPSLatitude: lat_dms,
        piexif.GPSIFD.GPSLongitudeRef: lon_ref,
        piexif.GPSIFD.GPSLongitude: lon_dms,
        piexif.GPSIFD.GPSAltitude: (0, 1),  # Sea level
        piexif.GPSIFD.GPSAltitudeRef: 0,
    }
    
    exif_dict['GPS'] = gps_ifd
    
    # Add location name to ImageDescription (searchable by AI)
    exif_dict['0th'][piexif.ImageIFD.ImageDescription] = location_name.encode('utf-8')
    
    # Add software tag
    exif_dict['0th'][piexif.ImageIFD.Software] = b'DelSolPrimeHomes EXIF Embedder'
    
    # Dump to bytes
    exif_bytes = piexif.dump(exif_dict)
    
    # Save image with new EXIF data
    img.save(output_path, exif=exif_bytes, quality=95, optimize=True)
    
    print(f"✓ Embedded GPS coordinates: {latitude}, {longitude}")
    print(f"✓ Location: {location_name}")
    print(f"✓ Saved to: {output_path}")
    
    return output_path


def batch_process(
    directory: str,
    location_key: Optional[str] = None,
    latitude: Optional[float] = None,
    longitude: Optional[float] = None,
    location_name: Optional[str] = None
) -> int:
    """
    Process all images in a directory.
    
    Args:
        directory: Directory containing images
        location_key: Predefined location key
        latitude: Custom latitude
        longitude: Custom longitude
        location_name: Custom location name
        
    Returns:
        Number of images processed
    """
    count = 0
    supported_formats = ('.jpg', '.jpeg', '.png', '.webp')
    
    for filename in os.listdir(directory):
        if filename.lower().endswith(supported_formats):
            filepath = os.path.join(directory, filename)
            try:
                embed_exif_geo(
                    filepath,
                    latitude=latitude,
                    longitude=longitude,
                    location_name=location_name,
                    location_key=location_key
                )
                count += 1
            except Exception as e:
                print(f"✗ Error processing {filename}: {e}")
    
    return count


if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(
        description='Embed GPS coordinates and location metadata into images'
    )
    parser.add_argument('image', help='Image file or directory to process')
    parser.add_argument('-o', '--output', help='Output file path (default: overwrite input)')
    parser.add_argument('-lat', '--latitude', type=float, help='Latitude in decimal degrees')
    parser.add_argument('-lon', '--longitude', type=float, help='Longitude in decimal degrees')
    parser.add_argument('-l', '--location', help='Location name')
    parser.add_argument('-k', '--location-key', help='Predefined location key (marbella, estepona, etc.)')
    parser.add_argument('-b', '--batch', action='store_true', help='Process all images in directory')
    
    args = parser.parse_args()
    
    if args.batch:
        count = batch_process(
            args.image,
            location_key=args.location_key,
            latitude=args.latitude,
            longitude=args.longitude,
            location_name=args.location
        )
        print(f"\n✓ Processed {count} images")
    else:
        embed_exif_geo(
            args.image,
            output_path=args.output,
            latitude=args.latitude,
            longitude=args.longitude,
            location_name=args.location,
            location_key=args.location_key
        )
