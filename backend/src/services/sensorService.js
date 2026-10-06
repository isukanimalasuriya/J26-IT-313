import { db, admin } from "../config/firebase.js";

export const saveSensorReading = async (data) => {
  const reading = {
    deviceId: data.deviceId,

    nitrogen: Number(data.nitrogen),
    phosphorus: Number(data.phosphorus),
    potassium: Number(data.potassium),

    soilMoisture: Number(data.soilMoisture),
    soilPh: Number(data.soilPh),
    salinity: Number(data.salinity),

    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  const document = await db
    .collection("sensor_readings")
    .add(reading);

  return {
    id: document.id,
    ...reading,
  };
};

export const getSensorReadings = async () => {
  const snapshot = await db
    .collection("sensor_readings")
    .orderBy("createdAt", "desc")
    .limit(50)
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};