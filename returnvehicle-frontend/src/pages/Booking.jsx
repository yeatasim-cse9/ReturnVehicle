import React from "react";
import { useParams } from "react-router-dom";

export default function Booking() {
  const { id } = useParams();
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold">Booking Page</h2>
      <p className="mt-2 text-gray-600">Ride ID: {id}</p>
    </div>
  );
}
