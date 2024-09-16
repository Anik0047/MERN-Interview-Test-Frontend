// AllDrawings.js

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './AllDrawings.css'

const AllDrawings = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://whiteboard-backend-sooty.vercel.app/images')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => setImages(data))
      .then(() => setLoading(false))
      .catch((error) => console.error('Error fetching images:', error));
  }, []);

  return (
    <div>
      <h1>All Drawings</h1>
      {!loading ? (<div className='allDrawings'>
      {images.map((image) => (
          <div className='allDrawing' key={image._id}>
            <Link to={`/images/${image._id}`}>
              <img className='allDrawingimg' src={image.imageData} alt={image.name} width="100" />
              <p className='allDrawingName'>{image.name}</p>
            </Link>
          </div>
        ))}
      </div>) : <p>Loading....</p>}
    </div>
  );
};

export default AllDrawings;
