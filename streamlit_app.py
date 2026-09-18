
import streamlit as st
import os
import re

# High-fidelity Industrial Configuration
st.set_page_config(
    page_title="ThermoLab Industrial",
    page_icon="🧪",
    layout="wide",
)

# Professional UI Styling
st.markdown("""
    <style>
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    header {visibility: hidden;}
    .stApp { background-color: #0f172a; margin: 0; padding: 0; }
    iframe { border: none !important; width: 100%; height: 98vh; }
    </style>
""", unsafe_allow_html=True)

# Path to Laboratory Assets
BASE_DIR = os.path.join(os.getcwd(), "static")
INDEX_PATH = os.path.join(BASE_DIR, "index.html")

@st.cache_data
def get_compiled_lab():
    if not os.path.exists(INDEX_PATH):
        return "ERROR: Laboratory System not found in /static directory."

    with open(INDEX_PATH, 'r', encoding='utf-8') as f:
        html = f.read()

    # Inject base href to ensure KaTeX fonts and SVGs resolve to /static/assets/
    # This is critical for cloud-hosted environments
    html = html.replace('<head>', '<head>\n    <base href="/static/">')

    # 1. Industrial Style Inlining (CSS)
    css_match = re.search(r'<link rel="stylesheet"[^>]+href="\./assets/(index-[^"]+\.css)"', html)
    if css_match:
        css_file = css_match.group(1)
        css_path = os.path.join(BASE_DIR, "assets", css_file)
        if os.path.exists(css_path):
            with open(css_path, 'r', encoding='utf-8') as f:
                css_content = f.read()
            # Replace link tag with style block
            html = html.replace(css_match.group(0), f"<style>{css_content}</style>")

    # 2. Logic Core Inlining (JS)
    js_match = re.search(r'<script type="module"[^>]+src="\./assets/(index-[^"]+\.js)"[^>]*></script>', html)
    if js_match:
        js_file = js_match.group(1)
        js_path = os.path.join(BASE_DIR, "assets", js_file)
        if os.path.exists(js_path):
            with open(js_path, 'r', encoding='utf-8') as f:
                js_content = f.read()
            # Replace script tag with inline module
            # We use type="module" to maintain React compatibility
            html = html.replace(js_match.group(0), f'<script type="module">{js_content}</script>')

    return html

# Execute Deployment
lab_html = get_compiled_lab()

if "ERROR" in lab_html:
    st.error(lab_html)
else:
    # Serve the massive single-file laboratory core
    st.components.v1.html(lab_html, height=1000, scrolling=False)
