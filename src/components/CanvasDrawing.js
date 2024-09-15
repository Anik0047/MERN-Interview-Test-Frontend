import React, { useState, useRef, useEffect } from 'react';
import rough from 'roughjs/bundled/rough.esm.js';
import './CanvasDrawing.css'; // Import your CSS
import { Link } from 'react-router-dom';

const CanvasDrawing = () => {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const [tool, setTool] = useState('brush');
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushWidth, setBrushWidth] = useState(5);
  const [selectedColor, setSelectedColor] = useState('#000');
  const [fillColor, setFillColor] = useState(false);
  const [elements, setElements] = useState([]);
  const [textInputs, setTextInputs] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTextActive, setIsTextActive] = useState(false);
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });
  const [imageName, setImageName] = useState('');

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = 'round'; // Makes brush lines smooth
    ctxRef.current = ctx;
    drawAll();
  }, []);

  useEffect(() => {
    drawAll();
  }, [elements, textInputs]);

  const startDrawing = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
  
    if (tool === 'text') {
      setIsTextActive(true);
  
      const canvasRect = canvasRef.current.getBoundingClientRect();
      setTextPosition({ x: offsetX + canvasRect.left, y: offsetY + canvasRect.top });
      setInputText(''); // Reset text input field
      return;
    }
  
    setIsDrawing(true);
  
    if (tool === 'brush' || tool === 'eraser') {
      const ctx = ctxRef.current;
      ctx.beginPath();
      ctx.moveTo(offsetX, offsetY);
      setElements((prevState) => [
        ...prevState,
        { type: 'brush', tool, points: [{ x: offsetX, y: offsetY }], color: tool === 'brush' ? selectedColor : '#fff', brushWidth },
      ]);
    } else {
      const roughCanvas = rough.canvas(canvasRef.current);
      let element = null;
  
      if (tool === 'rectangle') {
        element = roughCanvas.rectangle(offsetX, offsetY, 0, 0, {
          stroke: selectedColor,
          fill: fillColor ? selectedColor : 'transparent',
          strokeWidth: brushWidth,
        });
      } else if (tool === 'circle') {
        element = roughCanvas.circle(offsetX, offsetY, 0, {
          stroke: selectedColor,
          fill: fillColor ? selectedColor : 'transparent',
          strokeWidth: brushWidth,
        });
      } else if (tool === 'triangle') {
        element = roughCanvas.polygon([[offsetX, offsetY], [offsetX, offsetY], [offsetX, offsetY]], {
          stroke: selectedColor,
          fill: fillColor ? selectedColor : 'transparent',
          strokeWidth: brushWidth,
        });
      }
  
      setElements((prevState) => [...prevState, { element, offsetX, offsetY, type: tool }]);
    }
  };
  
  const draw = (e) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = e.nativeEvent;
  
    if (tool === 'brush' || tool === 'eraser') {
      const updatedElements = [...elements];
      const currentBrush = updatedElements[updatedElements.length - 1];
  
      currentBrush.points = [...currentBrush.points, { x: offsetX, y: offsetY }];
      setElements(updatedElements);
  
      const ctx = ctxRef.current;
      ctx.strokeStyle = currentBrush.color;
      ctx.lineWidth = currentBrush.brushWidth;
      ctx.lineTo(offsetX, offsetY);
      ctx.stroke();
  
      // Handle erasing text
      if (tool === 'eraser') {
        setTextInputs((prevTextInputs) =>
          prevTextInputs.filter((textInput) => {
            const textWidth = ctx.measureText(textInput.text).width;
            const textHeight = brushWidth * 4; // Adjust the height based on the brush width (font size)
            
            const withinXRange = offsetX > textInput.x && offsetX < textInput.x + textWidth;
            const withinYRange = offsetY > textInput.y - textHeight && offsetY < textInput.y;
  
            // Remove text if eraser is within the text's bounding box
            return !(withinXRange && withinYRange);
          })
        );
      }
    } else {
      // Clear and redraw everything for shapes
      ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      drawAll();
  
      let lastElement = elements[elements.length - 1];
      if (tool === 'rectangle') {
        lastElement.element = rough.canvas(canvasRef.current).rectangle(
          lastElement.offsetX,
          lastElement.offsetY,
          offsetX - lastElement.offsetX,
          offsetY - lastElement.offsetY,
          {
            stroke: selectedColor,
            fill: fillColor ? selectedColor : 'transparent',
            strokeWidth: brushWidth,
          }
        );
      } else if (tool === 'circle') {
        const radius = Math.sqrt(
          Math.pow(offsetX - lastElement.offsetX, 2) + Math.pow(offsetY - lastElement.offsetY, 2)
        );
        lastElement.element = rough.canvas(canvasRef.current).circle(
          lastElement.offsetX,
          lastElement.offsetY,
          radius * 2,
          {
            stroke: selectedColor,
            fill: fillColor ? selectedColor : 'transparent',
            strokeWidth: brushWidth,
          }
        );
      } else if (tool === 'triangle') {
        lastElement.element = rough.canvas(canvasRef.current).polygon(
          [[lastElement.offsetX, lastElement.offsetY], [offsetX, offsetY], [lastElement.offsetX * 2 - offsetX, offsetY]],
          {
            stroke: selectedColor,
            fill: fillColor ? selectedColor : 'transparent',
            strokeWidth: brushWidth,
          }
        );
      }
  
      const updatedElements = [...elements];
      updatedElements[elements.length - 1] = lastElement;
      setElements(updatedElements);
    }
  };
  
  

  const finishDrawing = () => {
    setIsDrawing(false);
  };

  const drawAll = () => {
    const roughCanvas = rough.canvas(canvasRef.current);
    const ctx = ctxRef.current;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  
    elements.forEach(({ element, type, points, color, brushWidth }) => {
      if (type === 'brush') {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = brushWidth;
        points.forEach((point, index) => {
          if (index === 0) {
            ctx.moveTo(point.x, point.y);
          } else {
            ctx.lineTo(point.x, point.y);
          }
        });
        ctx.stroke();
      } else {
        roughCanvas.draw(element);
      }
    });
  
    textInputs.forEach(({ text, x, y }) => {
      ctx.font = `${brushWidth * 4}px Arial`;
      ctx.fillStyle = selectedColor;
      ctx.fillText(text, x, y);
    });
  };

  const clearCanvas = () => {
    setElements([]);
    setTextInputs([]);
    drawAll();
  };

  const handleTextSubmit = (e) => {
    e.preventDefault();
    const canvasRect = canvasRef.current.getBoundingClientRect();
    setTextInputs((prevState) => [
      ...prevState,
      { text: inputText, x: textPosition.x - canvasRect.left, y: textPosition.y - canvasRect.top },
    ]);
    setInputText('');
    setIsTextActive(false);
  };

  // Function to save the image
  const saveImage = async () => {
    if (!imageName.trim()) {
      alert('Please enter a name for the image.');
      return;
    }
    
    const canvas = canvasRef.current;
    const imageData = canvas.toDataURL('image/png');
  
    try {
      const response = await fetch('http://localhost:5000/save-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageName, imageData }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to save image');
      }
  
      const result = await response.text();
      alert(result);
    } catch (error) {
      alert('Error saving image: ' + error.message);
    }
  };
  

  return (
    <div>
      <div className="container">
      <section className="tools-board">
        <div className="row">
        <div className="img-name">
        <label>Image Name</label>
        <input type="text" value={imageName} onChange={(e) => setImageName(e.target.value)} />
      </div>
          <label className="title">Shapes</label>
          <ul className="options">
            <li className={`option tool ${tool === 'rectangle' ? 'active' : ''}`} onClick={() => setTool('rectangle')}>
              <span>Rectangle</span>
            </li>
            <li className={`option tool ${tool === 'circle' ? 'active' : ''}`} onClick={() => setTool('circle')}>
              <span>Circle</span>
            </li>
            <li className={`option tool ${tool === 'triangle' ? 'active' : ''}`} onClick={() => setTool('triangle')}>
              <span>Triangle</span>
            </li>
            <li className={`option tool ${tool === 'brush' ? 'active' : ''}`} onClick={() => setTool('brush')}>
              <span>Brush</span>
            </li>
            <li className={`option tool ${tool === 'eraser' ? 'active' : ''}`} onClick={() => setTool('eraser')}>
              <span>Eraser</span>
            </li>
            <li className={`option tool ${tool === 'text' ? 'active' : ''}`} onClick={() => setTool('text')}>
              <span>Text</span>
            </li>
            <li className="option">
              <input type="checkbox" id="fill-color" onChange={(e) => setFillColor(e.target.checked)} />
              <label htmlFor="fill-color">Fill color</label>
            </li>
          </ul>
        </div>
        <div className="row">
          <label className="title">Options</label>
          <ul className="options">
            <li className="option">
              <input type="range" id="size-slider" min="1" max="30" value={brushWidth} onChange={(e) => setBrushWidth(e.target.value)} />
            </li>
          </ul>
        </div>
        <div className="row colors">
          <label className="title color">Colors</label>
          <input type="color" id="color-picker" value={selectedColor} onChange={(e) => setSelectedColor(e.target.value)} />
        </div>
        <div className="row buttons">
          <button className="clear-canvas" onClick={clearCanvas}>Clear Canvas</button>
        </div>
        <div className="row buttons">
          <button className="save-img" onClick={saveImage}>Save as Image</button>
        </div>
      </section>
      <section className="drawing-board">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={finishDrawing}
        />
        {isTextActive && (
          <form
            onSubmit={handleTextSubmit}
            style={{
              position: 'absolute',
              top: `${textPosition.y}px`,
              left: `${textPosition.x}px`,
              backgroundColor: '#fff',
              padding: '5px',
              border: '1px solid #000',
              zIndex: 10
            }}
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              style={{ border: '1px solid #000', backgroundColor: '#fff' }}
              autoFocus
            />
            <button type="submit">Submit</button>
          </form>
        )}
      </section>
    </div>
    <div className="viewAllDrawing">
  <Link to="/all-drawings">
    <button className="view-all">View All Drawings</button>
  </Link>
</div>

    </div>
  );
};

export default CanvasDrawing;
