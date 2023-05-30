Blockly.Python['block_type'] = function(block) {
  var dropdown_name = block.getFieldValue('NAME');
  var value_code = Blockly.Python.valueToCode(block, 'code', Blockly.Python.ORDER_ATOMIC);
  // TODO: Assemble Python into code variable.
  var code = '...\n';
  return code;
};
