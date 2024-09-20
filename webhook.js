const axios = require('axios');

const createWebhook = async () => {
  const token = "patY2dyKsgteJlzcP.37e931829f2d6bec4c5d4d1c8d5c5e064ec72215ed14b8d4704eaa44e34bd327";
  const baseId = "app8IbOvqx9URXwkJ"; 
  const tableId = "tbl8yfuVkf6wNaazJ";
  
  const url = "https://api.airtable.com/v0/bases/app8IbOvqx9URXwkJ/webhooks";

  // const body = {
  //   notificationUrl: "https://96eb-111-88-86-241.ngrok-free.app/webhook",
  //   specification: {
  //     scope: "tableData",  // Define the scope
  //     options: {
  //       filters: {
  //         watchDataTypes: ["tableData"], // The correct field for data types
  //       },
  //     },
  //   },
  //   cursorForNextPayload: 0, // Start from the first event
  // };

  const body = {
    notificationUrl: "https://96eb-111-88-86-241.ngrok-free.app/webhook",
    specification: {
      options: {
        filters: {
          dataTypes: ["tableData"],  // Specify the type of data you want the webhook to trigger on
          recordChangeScope: tableId // Table ID to watch for changes
        }
      }
    }
  };

  try {
    const response = await axios.post(url, body, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    console.log('Webhook Created: ', response.data);
  } catch (error) {
    console.error('Error creating webhook: ', error.response?.data || error.message);
  }
};

createWebhook();
