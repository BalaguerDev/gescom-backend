import { getClients } from '../services/clientService.js';

export const getClientsHandler = async (req, res) => {
  try {
    const clients = await getClients();
    res.status(200).json({ success: true, data: clients });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
