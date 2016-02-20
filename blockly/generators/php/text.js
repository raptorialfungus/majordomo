/**
 * @license
 * Visual Blocks Language
 *
 * Copyright 2012 Google Inc.
 * https://blockly.googlecode.com/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Generating PHP for text blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.PHP.text');

goog.require('Blockly.PHP');


Blockly.PHP['text'] = function(block) {
  // Text value.
  var code = Blockly.PHP.quote_(block.getFieldValue('TEXT'));
  return [code, Blockly.PHP.ORDER_ATOMIC];
};

Blockly.PHP['text_join'] = function(block) {
  // Create a string made up of any number of elements of any type.
  var code;
  if (block.itemCount_ == 0) {
    return ['\'\'', Blockly.PHP.ORDER_ATOMIC];
  } else if (block.itemCount_ == 1) {
    var argument0 = Blockly.PHP.valueToCode(block, 'ADD0',
        Blockly.PHP.ORDER_NONE) || '\'\'';
    code = '(String) ' + argument0 + ' ';
    return [code, Blockly.PHP.ORDER_FUNCTION_CALL];
  } else if (block.itemCount_ == 2) {
    var argument0 = Blockly.PHP.valueToCode(block, 'ADD0',
        Blockly.PHP.ORDER_NONE) || '\'\'';
    var argument1 = Blockly.PHP.valueToCode(block, 'ADD1',
        Blockly.PHP.ORDER_NONE) || '\'\'';
    code = '(String) ' + argument0 + ' . (String) ' + argument1 + ' ';
    return [code, Blockly.PHP.ORDER_ADDITION];
  } else {
    code = new Array(block.itemCount_);
    for (var n = 0; n < block.itemCount_; n++) {
      code[n] = '(String) '+Blockly.PHP.valueToCode(block, 'ADD' + n, Blockly.PHP.ORDER_COMMA) || '\'\'';
    }
    code = code.join('.');
    return [code, Blockly.PHP.ORDER_FUNCTION_CALL];
  }
};

Blockly.PHP['text_append'] = function(block) {
  // Append to a variable in place.
  var varName = Blockly.PHP.variableDB_.getName(
      block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  var argument0 = Blockly.PHP.valueToCode(block, 'TEXT',
      Blockly.PHP.ORDER_NONE) || '\'\'';
  return '$'+varName + ' = (String) $' + varName + ' . (String) ' + argument0 + ';\n';
};

Blockly.PHP['text_length'] = function(block) {
  // String length.
  var argument0 = Blockly.PHP.valueToCode(block, 'VALUE',
      Blockly.PHP.ORDER_FUNCTION_CALL) || '\'\'';
  return ['mb_strlen('+argument0 + ', "UTF-8")', Blockly.PHP.ORDER_MEMBER];
};

Blockly.PHP['text_isEmpty'] = function(block) {
  // Is the string null?
  var argument0 = Blockly.PHP.valueToCode(block, 'VALUE',
      Blockly.PHP.ORDER_MEMBER) || '\'\'';
  return ['!' + argument0, Blockly.PHP.ORDER_LOGICAL_NOT];
};

Blockly.PHP['text_indexOf'] = function(block) {
  // Search the text for a substring.
  var operator = block.getFieldValue('END') == 'FIRST' ?
      'mb_strpos' : 'mb_strrpos';
  var argument0 = Blockly.PHP.valueToCode(block, 'FIND',
      Blockly.PHP.ORDER_NONE) || '\'\'';
  var argument1 = Blockly.PHP.valueToCode(block, 'VALUE',
      Blockly.PHP.ORDER_MEMBER) || '\'\'';
  var code = operator + '(' + argument1 +', '+ argument0 + ', 0, "UTF-8")';  
  return [code, Blockly.PHP.ORDER_MEMBER];
};

Blockly.PHP['text_charAt'] = function(block) {
  // Get letter at index.
  // Note: Until January 2013 this block did not have the WHERE input.
  var where = block.getFieldValue('WHERE') || 'FROM_START';
  var at = Blockly.PHP.valueToCode(block, 'AT',
      Blockly.PHP.ORDER_UNARY_NEGATION) || '1';
  var text = Blockly.PHP.valueToCode(block, 'VALUE',
      Blockly.PHP.ORDER_MEMBER) || '\'\'';
  switch (where) {
    case 'FIRST':
      var code = 'mb_substr('+text+', 0, 1, "UTF-8")';
      return [code, Blockly.PHP.ORDER_FUNCTION_CALL];
    case 'LAST':
      var code = 'mb_substr('+text+', -1, 1, "UTF-8")';
      return [code, Blockly.PHP.ORDER_FUNCTION_CALL];
    case 'FROM_START':
      // Blockly uses one-based indicies.
      if (Blockly.isNumber(at)) {
        // If the index is a naked number, decrement it right now.
        at = parseFloat(at) - 1;
      } else {
        // If the index is dynamic, decrement it in code.
        at += ' - 1';
      }
      var code = 'mb_substr('+text+', '+at+', mb_strlen('+text+', "UTF-8"), "UTF-8")';
      return [code, Blockly.PHP.ORDER_FUNCTION_CALL];
    case 'FROM_END':
      var code = 'mb_substr('+text+', -'+at+', mb_strlen('+text+', "UTF-8"), "UTF-8")';
      return [code, Blockly.PHP.ORDER_FUNCTION_CALL];
    case 'RANDOM':
	  var code = 'mb_substr('+text+', rand(0, mb_strlen('+text+', "UTF-8")-1), 1, "UTF-8")';
      return [code, Blockly.PHP.ORDER_FUNCTION_CALL];
  }
  throw 'Unhandled option (text_charAt).';
};

Blockly.PHP['text_getSubstring'] = function(block) {
  // Get substring.
  var text = Blockly.PHP.valueToCode(block, 'STRING',
      Blockly.PHP.ORDER_MEMBER) || '\'\'';
  var where1 = block.getFieldValue('WHERE1');
  var where2 = block.getFieldValue('WHERE2');
  var at1 = Blockly.PHP.valueToCode(block, 'AT1',
      Blockly.PHP.ORDER_NONE) || '1';
  var at2 = Blockly.PHP.valueToCode(block, 'AT2',
      Blockly.PHP.ORDER_NONE) || '1';
  if (where1 == 'FIRST' && where2 == 'LAST') {
    var code = text;
  } else {
    // TODO Nide test
	var code = 'mb_substr('+ text+', '+at1+', '+(at2-at1+1)+', "UTF-8")'  
  }
  return [code, Blockly.PHP.ORDER_FUNCTION_CALL];
};

Blockly.PHP['text_changeCase'] = function(block) {
  // Change capitalization.

  var OPERATORS = {
    'UPPERCASE': 'MB_CASE_UPPER',
    'LOWERCASE': 'MB_CASE_LOWER',
    'TITLECASE': 'MB_CASE_TITLE'
  };
  var operator = OPERATORS[block.getFieldValue('CASE')];   
  var argument0 = Blockly.PHP.valueToCode(block, 'TEXT', Blockly.PHP.ORDER_MEMBER) || '\'\'';
  var code = 'mb_convert_case('+argument0+', '+operator+', "UTF-8")';
  return [code, Blockly.PHP.ORDER_FUNCTION_CALL];
};

Blockly.PHP['text_trim'] = function(block) {
  // Trim spaces.
  var OPERATORS = {
    'LEFT': 'ltrim',
    'RIGHT': 'rtrim',
    'BOTH': 'trim'
  };
  var operator = OPERATORS[block.getFieldValue('MODE')];
  var argument0 = Blockly.PHP.valueToCode(block, 'TEXT',
      Blockly.PHP.ORDER_MEMBER) || '\'\'';
  return [operator+'('+argument0+')', Blockly.PHP.ORDER_FUNCTION_CALL];
};

Blockly.PHP['text_print'] = function(block) {
  // Print statement.
  var argument0 = Blockly.PHP.valueToCode(block, 'TEXT',
      Blockly.PHP.ORDER_NONE) || '\'\'';
  return 'echo ' + argument0 + ';\n';
};

Blockly.PHP['text_prompt'] = function(block) {
  // Prompt function (internal message).
  /*
  var msg = Blockly.PHP.quote_(block.getFieldValue('TEXT'));
  var code = 'window.prompt(' + msg + ')';
  var toNumber = block.getFieldValue('TYPE') == 'NUMBER';
  if (toNumber) {
    code = 'parseFloat(' + code + ')';
  }
  */
  code = '';  
  return [code, Blockly.PHP.ORDER_FUNCTION_CALL];
};

Blockly.PHP['text_prompt_ext'] = function(block) {
  // Prompt function (external message).
  /*
  var msg = Blockly.PHP.valueToCode(block, 'TEXT',
      Blockly.PHP.ORDER_NONE) || '\'\'';
  var code = 'window.prompt(' + msg + ')';
  var toNumber = block.getFieldValue('TYPE') == 'NUMBER';
  if (toNumber) {
    code = 'parseFloat(' + code + ')';
  }
  */
  code = '';
  return [code, Blockly.PHP.ORDER_FUNCTION_CALL];
};
