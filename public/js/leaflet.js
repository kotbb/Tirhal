import L from 'leaflet';

export const displayMap = (locations) => {
  var map = L.map('map', { zoomControl: false });
  // var map = L.map('map', { zoomControl: false }).setView([31.111745, -118.113491], );

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  const points = [];
  locations.forEach((loc) => {
    const point = [loc.coordinates[1], loc.coordinates[0]];
    points.push(point);
    L.marker(point)
      .addTo(map)
      .bindPopup(
        `<h1 style="font-size: 1.4rem">Day ${loc.day}: ${loc.description}</h1>`,
        {
          autoClose: false,
        }
      )
      .openPopup();
  });

  const bounds = L.latLngBounds(points).pad(0.5);
  map.fitBounds(bounds);

  map.scrollWheelZoom.disable();
};
