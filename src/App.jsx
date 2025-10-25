import { useEffect, useRef, useState } from 'react';
import Places from './components/Places.jsx';
import { AVAILABLE_PLACES } from './data.js';
import Modal from './components/Modal.jsx';
import DeleteConfirmation from './components/DeleteConfirmation.jsx';
import logoImg from './assets/logo.png';
import { sortPlacesByDistance } from "./loc.js"


import SplashCursor from "../reactbits/SplashCursor/SplashCursor.jsx"
// import Particles from "../reactbits2/Particles/Particles.jsx"
// import BlurText from "../reactbits3/BlurText/BlurText.jsx"
// import RotatingText from "../reactbits4/RotatingText/RotatingText.jsx"





const storedIds = JSON.parse(localStorage.getItem("visiting-will-be")) || [];
const storedPlaces = storedIds.map(id => AVAILABLE_PLACES.find(place => place.id === id));
console.log(storedPlaces);

function App() {
  const modal = useRef();
  const selectedPlace = useRef();
  const [pickedPlaces, setPickedPlaces] = useState(storedPlaces);
  const [availablePlaces, setAvailablePlaces] = useState([]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      const sortedPlaces = sortPlacesByDistance(
        AVAILABLE_PLACES,
        position.coords.latitude,
        position.coords.longitude
      );
      setAvailablePlaces(sortedPlaces);
    });
  }, []);


  function handleStartRemovePlace(id) {
    modal.current.open();
    selectedPlace.current = id;
  }

  function handleStopRemovePlace() {
    modal.current.close();
  }

  function handleSelectPlace(id) {

    setPickedPlaces((prevPickedPlaces) => {

      if (prevPickedPlaces.some((place) => place.id === id)) {
        return prevPickedPlaces;
      }
      const place = AVAILABLE_PLACES.find((place) => place.id === id);
      return [place, ...prevPickedPlaces];
    });
    const storedIds = JSON.parse(localStorage.getItem("visiting-will-be")) || [];
    if (storedIds.indexOf(id) === -1) {
      localStorage.setItem('visiting-will-be', JSON.stringify([id, ...storedIds]));
    }
  }

  function handleRemovePlace() {
   
    setPickedPlaces((prevPickedPlaces) =>
      prevPickedPlaces.filter((place) => place.id !== selectedPlace.current)
    );
    modal.current.close();

    const storedIds = JSON.parse(localStorage.getItem("visiting-will-be"));
    localStorage.setItem(
      "visiting-will-be",
      JSON.stringify(storedIds.filter((id) => id !== selectedPlace.current))
    );
  }

  

  return (
    <>
    <SplashCursor />
      <Modal ref={modal}>
        <DeleteConfirmation
          onCancel={handleStopRemovePlace}
          onConfirm={handleRemovePlace}
       />
      </Modal>

      <header>
        <img src={logoImg} alt="Stylized globe" />
     
       <h1>PlacePicker</h1>
        <p>
          Create your personal collection of places you would like to visit or
          you have visited.
        </p>
      </header>
      <main>
        <Places
          title="I'd like to visit ..."
          fallbackText={'Select the places you would like to visit below.'}
          places={pickedPlaces}
          onSelectPlace={handleStartRemovePlace}
        />
        <Places
          title="Available Places"
          fallbackText={"Places will be available by distance soon ..."}
          places={availablePlaces}
          onSelectPlace={handleSelectPlace}
        />
      </main>
    </>
  );
}

export default App;
