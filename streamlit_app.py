
import streamlit as st

# Configure page for high-fidelity lab
st.set_page_config(
    page_title="ThermoLab Industrial",
    page_icon="🧪",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Hide Streamlit Chrome
st.markdown("""
    <style>
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    header {visibility: hidden;}
    .stApp { background-color: #0f172a; margin: 0; padding: 0; }
    iframe { border: none !important; width: 100vw; height: 100vh; }
    </style>
""", unsafe_allow_html=True)

# The 'static' folder is served automatically because of .streamlit/config.toml
# We point the iframe to the entry point of the React app
st.components.v1.iframe("./static/index.html", height=1000, scrolling=False)
