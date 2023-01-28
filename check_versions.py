#!/usr/bin/env python3

import json
import os

os.chdir(os.path.dirname(os.path.abspath(__file__)))

def get_tauri_version():
    with open("host/tauri.conf.json") as f:
        config = json.load(f)
    return config["package"]["version"]

def get_package_version():
    with open("ui/package.json") as f:
        config = json.load(f)
    return config["version"]

def check_versions():
    tauri_version = get_tauri_version()
    package_version = get_package_version()
    if tauri_version != package_version:
        print(f"Tauri version {tauri_version} does not match UI package version {package_version}")
        exit(1)
    else:
        print(f"Tauri and UI package versions match: {tauri_version}")

if __name__ == "__main__":
    check_versions()
