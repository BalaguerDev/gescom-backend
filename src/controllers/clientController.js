import { getClients, createClient } from "../services/clientService.js";

export const getClientsHandler = async (req, res) => {
  try {
    const clients = await getClients();
    res.status(200).json({ success: true, data: clients });
  } catch (error) {
    console.error("❌ Error en getClientsHandler:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createClientHandler = async (req, res) => {
  try {
    const clientData = req.body;
    const newClient = await createClient(clientData);
    res.status(201).json({ success: true, data: newClient });
  } catch (error) {
    console.error("❌ Error en createClientHandler:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};