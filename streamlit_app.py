
import streamlit as st
import os

# Set page config for industrial lab
st.set_page_config(
    page_title="ThermoLab: Digital Heat-Transfer Experiments",
    page_icon="🧪",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Hide Streamlit UI elements
st.markdown("""
    <style>
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    header {visibility: hidden;}
    body { background-color: #0f172a; }
    .stApp { margin: 0; padding: 0; }
    iframe { border: none !important; width: 100%; height: 95vh; }
    .stHtml { padding: 0; }
    div[data-testid="stVerticalBlock"] > div:first-child { padding: 0; }
    </style>
""", unsafe_allow_html=True)

# Path to the compiled React app
build_path = os.path.join(os.getcwd(), "thermolab-web", "dist", "index.html")

if not os.path.exists(build_path):
    st.error(f"Error: Laboratory Build not found at {build_path}. Please ensure 'thermolab-web/dist' is pushed to GitHub.")
else:
    # Use standard Streamlit components to serve the HTML file directly
    with open(build_path, 'r', encoding='utf-8') as f:
        html_string = f.read()

    # Inject base href to ensure assets load from the correct relative path
    # This helps when serving static HTML content directly
    head_tag = "<head>"
    if head_tag in html_string:
        html_string = html_string.replace(head_tag, head_tag + '\n    <base href="./">')

    st.components.v1.html(html_string, height=1000, scrolling=True)
