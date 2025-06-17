"""
This module script is similar to running `python3 -m http.server --bind 127.0.0.1 3000 -d dist`
from the command line, but automatically runs the build script prior to starting up
the web server
"""

import os
import subprocess
from shodo_ssg import build_static_site, start_server

if __name__ == "__main__":
    # Set the ROOT_PATH variable to the directory of this file
    root_path = os.path.dirname(os.path.abspath(__file__))
    # Bundle and minify the JavaScript files
    subprocess.run(["npm", "run", "dev"], check=True)
    build_static_site(root_path)
    start_server(root_path)
