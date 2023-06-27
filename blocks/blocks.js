Blockly.defineBlocksWithJsonArray(
[{
  "type": "netpie_connect",
  "message0": "Connect NETPIE.io %1 Device ID: %2 Device Token: %3 Subscribe private msg: %4 %5 Subscribe shadow updated: %6",
  "args0": [
    {
      "type": "input_dummy"
    },
    {
      "type": "input_value",
      "name": "device_id",
      "check": "String",
      "align": "RIGHT"
    },
    {
      "type": "input_value",
      "name": "device_token",
      "check": "String",
      "align": "RIGHT"
    },
    {
      "type": "field_checkbox",
      "name": "sub_private_msg",
      "align": "RIGHT",
      "checked": true,
    },
    {
      "type": "input_dummy",
      "align": "RIGHT"
    },
    {
      "type": "field_checkbox",
      "name": "sub_shadow_updated",
      "align": "RIGHT",
      "checked": true
    },
    ],
    "inputsInline": false,
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#4A7CCC",
    "tooltip": "",
    "helpUrl": ""
  },

  {
    "type": "netpie_on_connected",
    "message0": "On Connected %1 do %2",
    "args0": [
      {
        "type": "input_dummy"
      },
      {
        "type": "input_statement",
        "name": "callback"
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#4A7CCC"
  },

  {
    "type": "netpie_on_disconnected",
    "message0": "On Disconnected %1 do %2",
    "args0": [
      {
        "type": "input_dummy"
      },
      {
        "type": "input_statement",
        "name": "callback"
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#4A7CCC"
  },


  {
    "type": "netpie_publish",
    "message0": "Publish to topic: @msg/%1 with payload: %2",
    "args0": [
      {
        "type": "field_input",
        "name": "topic",
        "text": "home/switch"
      },
      {
        "type": "input_value",
        "name": "payload",
        "check": [
          "Boolean",
          "Number",
          "String"
        ],
        "align": "RIGHT"
      }
    ],
    "inputsInline": true,
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#339980",
    "tooltip": "",
    "helpUrl": ""
  },

  {
    "type": "netpie_subscribe",
    "message0": "Subscribe to topic: @msg/%1",
    "args0": [
      {
        "type": "field_input",
        "name": "topic",
        "text": "home/switch"
      }
    ],
    "inputsInline": true,
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#339980",
    "tooltip": "",
    "helpUrl": ""
  },



  {
    "type": "netpie_on_reveived_msg",
    "message0": "On Received message matching topic: @msg/%1 %2 do %3",
    "args0": [
      {
        "type": "field_input",
        "name": "topic",
        "text": "home/#"
      },
      {
        "type": "input_dummy"
      },
      {
        "type": "input_statement",
        "name": "callback"
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#339980"
  },


  {
    "type": "netpie_msg_payload",
    "message0": "@msg payload as %1",
    "args0": [
      {
        "type": "field_dropdown",
        "name": "datatype",
        "options": [
          [
            "string",
            "string"
          ],
          [
            "int",
            "int"
          ],
          [
            "float",
            "float"
          ]
        ]
      },

    ],
    "inputsInline": true,
    "output": null,
    "colour": "#339980"
  },


  {
    "type": "netpie_write_shadow_field",
    "message0": "Write @shadow field:%1 with value: %2",
    "args0": [
      {
        "type": "input_value",
        "name": "field",
        "text": ""
      },
      {
        "type": "input_value",
        "name": "value",
        "check": [
          "Boolean",
          "Number",
          "String"
        ],
        "align": "RIGHT"
      }
    ],
    "inputsInline": true,
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#cdac4c",
    "tooltip": "",
    "helpUrl": ""
  },


  {
    "type": "netpie_read_shadow",
    "message0": "Read @shadow %1 %2",
    "args0": [
      {
        "type": "input_dummy"
      },
      {
        "type": "input_statement",
        "name": "callback"
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#cdac4c"
  },


  {
    "type": "netpie_on_shadow_updated",
    "message0": "On @shadow updated %1 do %2",
    "args0": [
      {
        "type": "input_dummy"
      },
      {
        "type": "input_statement",
        "name": "callback"
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#cdac4c"
  },


  {
    "type": "netpie_shadow_field",
    "message0": "@shadow field: %1 as %2",
    "args0": [
      {
        "type": "input_value",
        "name": "field",
        "text": ""
      },
      {
        "type": "field_dropdown",
        "name": "datatype",
        "options": [
          [
            "int",
            "int"
          ],
          [
            "float",
            "float"
          ],
          [
            "string",
            "string"
          ],
          [
            "bool",
            "bool"
          ]
        ]
      }
    ],
    "inputsInline": true,
    "output": null,
    "colour": "#cdac4c",
    "tooltip": "",
    "helpUrl": ""
  },


  {
    "type": "netpie_on_reveived_private_msg",
    "message0": "On Received private message  of topic: @private/%1 %2 do %3",
    "args0": [
      {
        "type": "field_input",
        "name": "topic",
        "text": "command"
      },
      {
        "type": "input_dummy"
      },
      {
        "type": "input_statement",
        "name": "callback"
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#c76b99"
  },


  {
    "type": "netpie_private_msg_payload",
    "message0": "@private payload as %1",
    "args0": [
      {
        "type": "field_dropdown",
        "name": "datatype",
        "options": [
          [
            "string",
            "string"
          ],
          [
            "int",
            "int"
          ],
          [
            "float",
            "float"
          ]
        ]
      },

    ],
    "inputsInline": true,
    "output": null,
    "colour": "#c76b99"
  },


  {
    "type": "netpie_text",
    "message0": "\"%1\"",
    "args0": [
      {
        "type": "field_input",
        "name": "value",
        "text": "Hello",
        "check": [
          "String"
        ]
      }
    ],
    "inputsInline": true,
    "output": null,
    "colour": "#b3b3b3"
  },

  {
    "type": "netpie_number",
    "message0": "%1",
    "args0": [
      {
        "type": "field_input",
        "name": "value",
        "text": "1",
        "check": [
          "Number",
        ]
      }
    ],
    "inputsInline": true,
    "output": null,
    "colour": "#b3b3b3"
  },


  {
    "type": "netpie_boolean",
    "message0": "%1",
    "args0": [
      {
        "type": "field_dropdown",
        "name": "value",
        "options": [
          [
            "True",
            "True"
          ],
          [
            "False",
            "False"
          ]
        ]
      },

    ],
    "inputsInline": true,
    "output": null,
    "colour": "#b3b3b3"
  }

]);
