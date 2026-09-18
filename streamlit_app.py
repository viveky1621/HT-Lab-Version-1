
import streamlit as st
import os

# Set page config for industrial lab
st.set_page_config(
    page_title="ThermoLab Industrial",
    page_icon="🧪",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Professional Industrial UI Injection
st.markdown("""
    <style>
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    header {visibility: hidden;}
    .stApp { background-color: #0f172a; margin: 0; padding: 0; overflow: hidden; }
    /* Ensure the component fills the screen */
    div[data-testid="stHtml"] { width: 100%; height: 98vh; padding: 0; margin: 0; }
    iframe { border: none !important; width: 100% !important; height: 100% !important; }
    </style>
""", unsafe_allow_html=True)

# Path to the build file
INDEX_PATH = os.path.join(os.getcwd(), "static", "index.html")

if not os.path.exists(INDEX_PATH):
    st.error("SYSTEM ERROR: Static Rig not found. Please ensure 'static/' directory is pushed to GitHub.")
else:
    with open(INDEX_PATH, 'r', encoding='utf-8') as f:
        html_content = f.read()

    # Inject base href to point to Streamlit's static serving path
    # This allows the React app to find its JS and CSS in /static/assets/
    head_tag = "<head>"
    if head_tag in html_content:
        html_content = html_content.replace(head_tag, head_tag + '\n    <base href="/static/">')

    # Serve the HTML content
    st.components.v1.html(html_content, height=1000, scrolling=False)
