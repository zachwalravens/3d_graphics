import Head from "next/head";
import Image from "next/image";
import React, { useEffect, useState, useRef } from 'react';

function getViewAngle(x, y, z, viewerX, viewerY, viewerZ) {
  const adjustedX = x - viewerX;
  const adjustedY = y - viewerY;
  const adjustedZ = z - viewerZ;
  const xyDistance = Math.sqrt(adjustedX**2 + adjustedY**2);
  const yzDistance = Math.sqrt(adjustedY**2 + adjustedZ**2);

  const theta = radiansToDegrees(Math.atan2(adjustedX, yzDistance));
  const phi = radiansToDegrees(Math.atan2(adjustedZ, xyDistance));

  return [theta, phi];
}

function radiansToDegrees(radians) {
  return radians * (180 / Math.PI);
}

function MyCanvas() {
  const canvasRef = useRef(null);
  const [mousePosition, setMousePosition] = useState([null, null]);
  const [viewerCoordinates, setViewerCoordinates] = useState([50, 0, 10]);
  const [viewAngle, setViewAngle] = useState([0, 0]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const handleKeyDown = (event) => {
      const [x, y, z] = viewerCoordinates;
      const [theta, phi] = viewAngle;
      const moveDistance = 5;
      const angleAdjust = 5;

      if (event.key === 'w') {
        setViewerCoordinates([x, y + moveDistance, z]);
      }
      if (event.key === 's') {
        setViewerCoordinates([x, y - moveDistance, z]);
      }
      if (event.key === 'a') {
        setViewerCoordinates([x - moveDistance, y, z]);
      }
      if (event.key === 'd') {
        setViewerCoordinates([x + moveDistance, y, z]);
      }
      if (event.key === 'e') {
        setViewerCoordinates([x, y, z + moveDistance]);
      }
      if (event.key === 'q') {
        setViewerCoordinates([x, y, z - moveDistance]);
      }
      if (event.key === 'ArrowUp') {
        setViewAngle([theta, phi + angleAdjust]);
      }
      if (event.key === 'ArrowDown') {
        setViewAngle([theta, phi - angleAdjust]);
      }
      if (event.key === 'ArrowLeft') {
        setViewAngle([theta - angleAdjust, phi]);
      }
      if (event.key === 'ArrowRight') {
        setViewAngle([theta + angleAdjust, phi]);
      }
    };

    const handleMouseMove = (event) => {
      setMousePosition([event.clientX, event.clientY]);
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('keydown', handleKeyDown);

    let rectangleInfos = [];
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        const rectangle = [
          [i * 20, j * 20],
          [i * 20, (j + 1) * 20],
          [(i + 1) * 20, (j + 1) * 20],
          [(i + 1) * 20, j * 20]
        ];
        let color = 'white';
        if (i === 2 && j === 2) {
          color = 'blue';
        }
        rectangleInfos.push([rectangle, color]);
      }
    }

    canvas.width = 1000;
    canvas.height = 1000;
    const centerX = 500;
    const centerY = 500;
    const zoomFactor = 10;
    const [viewerX, viewerY, viewerZ] = viewerCoordinates;
    const [viewAngleTheta, viewAnglePhi] = viewAngle;

    rectangleInfos.forEach(function([myRectangle, color]) {
      const myProjectiveRectangle = myRectangle.map(([pointX, pointY]) => {
        const [theta, phi] = getViewAngle(pointX, pointY, 0, viewerX, viewerY, viewerZ);
        return [theta - viewAngleTheta, phi - viewAnglePhi];
      });

      ctx.moveTo(
        myProjectiveRectangle[3][0] * zoomFactor + centerX,
        centerY - zoomFactor * myProjectiveRectangle[3][1]
      );

      myProjectiveRectangle.forEach(function([theta, phi]) {
        const canvasX = theta * zoomFactor + centerX;
        const canvasY = centerY - phi * zoomFactor;
        ctx.lineTo(canvasX, canvasY);
      });

      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = 'blue';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [viewerCoordinates, viewAngle]);

  return (
    <>
      <canvas ref={canvasRef} className="canvas" />
      <p>mouse location: {mousePosition[0]}, {mousePosition[1]}</p>
      <p>viewer location: {viewerCoordinates[0]}, {viewerCoordinates[1]}, {viewerCoordinates[2]}</p>
      <p>view angles: {viewAngle[0]}, {viewAngle[1]}</p>
      <p>
      <b>Controls: <br /> <br /></b>
      W - move forwards <br />
      S - move backwards <br />
      A - move left <br />
      D - move right <br />
      E - move up <br />
      Q - move down <br />
      Up Arrow - look upwards <br />
      Down Arrow - look downwards <br />
      Left Arrow - look left <br />
      Right Arrow - look right <br />
      </p>
    </>
  );
}

export default function Home() {
  return (
    <>
      <Head>
        <title>3D Graphics</title>
        <meta name="description" content="." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svh" />
      </Head>
      <MyCanvas />
    </>
  );
}
