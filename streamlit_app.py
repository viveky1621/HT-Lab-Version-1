
import streamlit as st
import streamlit.components.v1 as components
import os
import http.server
import socketserver
import threading

# Set page config for industrial lab
st.set_page_config(
    page_title="ThermoLab: Digital Heat-Transfer Experiments",
    page_icon="🧪",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Configuration
PORT = 8000
DIRECTORY = os.path.join(os.getcwd(), "thermolab-web", "dist")

def serve_static():
    os.chdir(DIRECTORY)
    handler = http.server.SimpleHTTPRequestHandler
    with socketserver.TCPServer(("", PORT), handler) as httpd:
        httpd.serve_forever()

# Start the static file server in a background thread
if not hasattr(st, 'already_started_server'):
    st.already_started_server = True
    thread = threading.Thread(target=serve_static, daemon=True)
    thread.start()

# Hide Streamlit UI elements
st.markdown("""
    <style>
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    header {visibility: hidden;}
    body { background-color: #0f172a; }
    .stApp { margin: 0; padding: 0; }
    iframe { border: none !important; }
    </style>
""", unsafe_allow_html=True)

# Display the lab in a high-fidelity iframe
st.components.v1.iframe(f"http://localhost:{PORT}/index.html", height=900, scrolling=False)
