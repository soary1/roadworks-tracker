import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer } from 'react-leaflet'

function App() {
  return (
    <MapContainer
      center={[-18.91, 47.52]}
      zoom={12}
      style={{ height: '100vh', width: '100%' }}
      scrollWheelZoom
    >
      <TileLayer
        url="http://localhost:8081/styles/basic-preview/512/{z}/{x}/{y}.png"
        attribution="© OpenStreetMap contributors"
      />
    </MapContainer>
  )
}

export default App
