
import streamlit as st
import os

# 1. Industrial Laboratory Configuration
st.set_page_config(
    page_title="ThermoLab Industrial",
    page_icon="🧪",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# 2. UI Cleaning
st.markdown("""
    <style>
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    header {visibility: hidden;}
    .stApp { background-color: #0f172a; margin: 0; padding: 0; }
    iframe { border: none !important; width: 100vw; height: 100vh; }
    </style>
""", unsafe_allow_html=True)

# 3. Serving Logic
INDEX_PATH = os.path.join(os.getcwd(), "static", "index.html")

if not os.path.exists(INDEX_PATH):
    st.error("DCS Terminal Error: Laboratory hardware build (static/) not found in repository.")
else:
    with open(INDEX_PATH, 'r', encoding='utf-8') as f:
        html = f.read()

    # Correct Asset Paths for Streamlit Cloud Static Serving
    # We replace relative paths with the Streamlit static endpoint /app/static/
    # (Streamlit Cloud serves the 'static' folder at /static/ URL prefix)
    html = html.replace('href="./assets/', 'href="/static/assets/')
    html = html.replace('src="./assets/', 'src="/static/assets/')
    html = html.replace('href="./favicon.svg"', 'href="/static/favicon.svg"')

    # Inject Base Path for internal routing/fonts
    html = html.replace('<head>', '<head>\n    <base href="/static/">')

    # Render High-Fidelity Rig
    st.components.v1.html(html, height=1200, scrolling=True)
