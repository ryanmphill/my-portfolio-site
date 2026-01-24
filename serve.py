"""
This module script is similar to running `python3 -m http.server --bind 127.0.0.1 3000 -d dist`
from the command line, but automatically runs the build script prior to starting up
the web server
"""

import os
import re
import subprocess
from shodo_ssg import build_static_site, start_server


def minify_css(css_file_path):
    """Minify a CSS file located at css_file_path and write the minified version"""
    with open(css_file_path, "r", encoding="utf-8") as f:
        css = f.readlines()

    minified_css = "".join(line.strip() for line in css)

    # remove comments
    minified_css = re.sub(r"/\*[\s\S]*?\*/", "", minified_css)

    # remove quotes from url()
    minified_css = re.sub(r'url\((["\'])([^)]*)\1\)', r"url(\2)", minified_css)

    # collapse spaces
    minified_css = re.sub(r"\s+", " ", minified_css)

    # write out the minified css
    with open(css_file_path.replace(".css", ".css"), "w", encoding="utf-8") as f:
        f.write(minified_css)


if __name__ == "__main__":
    # Set the ROOT_PATH variable to the directory of this file
    root_path = os.path.dirname(os.path.abspath(__file__))
    # Bundle and minify the JavaScript files
    subprocess.run(["npm", "run", "dev"], check=True)
    build_static_site(root_path)
    minify_css(os.path.join(root_path, "dist", "static", "styles", "main.css"))
    start_server(root_path)
