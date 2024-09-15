import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './AllDrawings.css'

const ViewDrawing = () => {
  const { id } = useParams();
  const [image, setImage] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5000/images/${id}`)
      .then((response) => response.json())
      .then((data) => setImage(data))
      .catch((error) => console.error('Error fetching image:', error));
  }, [id]);

  return (
    <div>
      <h1>View Drawing</h1>
      {image ? (
        <div className='singleDrawing'>
          <img src={image.imageData} alt={image.name} />
          <p>{image.name}</p>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default ViewDrawing;
