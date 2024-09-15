// AllDrawings.js

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './AllDrawings.css'

const AllDrawings = () => {
  const [images, setImages] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/images')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => setImages(data))
      .catch((error) => console.error('Error fetching images:', error));
  }, []);

  return (
    <div>
      <h1>All Drawings</h1>
      <div className='allDrawings'>
      {images.map((image) => (
          <div className='allDrawing' key={image._id}>
            <Link to={`/images/${image._id}`}>
              <img className='allDrawingimg' src={image.imageData} alt={image.name} width="100" />
              <p className='allDrawingName'>{image.name}</p>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllDrawings;
