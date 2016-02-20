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
 * @fileoverview Generating PHP for list blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.PHP.lists');

goog.require('Blockly.PHP');


Blockly.PHP['lists_create_empty'] = function(block) {
  // Create an empty list.
  return ['array()', Blockly.PHP.ORDER_ATOMIC];
};

Blockly.PHP['lists_create_with'] = function(block) {
  // Create a list with any number of elements of any type.
  var code = new Array(block.itemCount_);
  for (var n = 0; n < block.itemCount_; n++) {
    code[n] = Blockly.PHP.valueToCode(block, 'ADD' + n,
        Blockly.PHP.ORDER_COMMA) || 'null';
  }
  code = 'array(' + code.join(', ') + ')';
  return [code, Blockly.PHP.ORDER_ATOMIC];
};

Blockly.PHP['lists_repeat'] = function(block) {
  // Create a list with one element repeated.
  var functionName = Blockly.PHP.provideFunction_(
      'lists_repeat',
      [ 'function ' + Blockly.PHP.FUNCTION_NAME_PLACEHOLDER_ +
          '(value, n) {',
        '  $res = array();',
        '  for ($i = 0; $i < $n; $i++) {',
        '    $res[] = $value;',
        '  }',
        '  return $res;',
        '}']);
  var argument0 = Blockly.PHP.valueToCode(block, 'ITEM',
      Blockly.PHP.ORDER_COMMA) || 'null';
  var argument1 = Blockly.PHP.valueToCode(block, 'NUM',
      Blockly.PHP.ORDER_COMMA) || '0';
  var code = functionName + '(' + argument0 + ', ' + argument1 + ')';
  return [code, Blockly.PHP.ORDER_FUNCTION_CALL];
};

Blockly.PHP['lists_length'] = function(block) {
  // List length.
  var argument0 = Blockly.PHP.valueToCode(block, 'VALUE',
      Blockly.PHP.ORDER_FUNCTION_CALL) || '[]';
  return ['count('+ argument0 + ')', Blockly.PHP.ORDER_MEMBER];
};

Blockly.PHP['lists_isEmpty'] = function(block) {
  // Is the list empty?
  var argument0 = Blockly.PHP.valueToCode(block, 'VALUE',
      Blockly.PHP.ORDER_MEMBER) || 'array()';
  return ['empty(' + argument0 + ')', Blockly.PHP.ORDER_LOGICAL_NOT];
};

Blockly.PHP['lists_indexOf'] = function(block) {
  // Find an item in the list.
  var operator = block.getFieldValue('END');
  var argument0 = Blockly.PHP.valueToCode(block, 'FIND',
      Blockly.PHP.ORDER_NONE) || '\'\'';
  var argument1 = Blockly.PHP.valueToCode(block, 'VALUE',
      Blockly.PHP.ORDER_MEMBER) || '[]';  
  var code = '';
  
  if (operator == 'FIRST') {
    code = 'array_search('+argument0+', '+argument1+')';
  } else {    
	code = 'count('+argument1+')-1-array_search('+argument0+', array_reverse('+argument1+'))';
  }
    
  return [code, Blockly.PHP.ORDER_MEMBER];
};

Blockly.PHP['lists_getIndex'] = function(block) {
  // Get element at index.
  // Note: Until January 2013 this block did not have MODE or WHERE inputs.
  var mode = block.getFieldValue('MODE') || 'GET';
  var where = block.getFieldValue('WHERE') || 'FROM_START';
  var at = Blockly.PHP.valueToCode(block, 'AT',
      Blockly.PHP.ORDER_UNARY_NEGATION) || '1';
  var list = Blockly.PHP.valueToCode(block, 'VALUE',
      Blockly.PHP.ORDER_MEMBER) || '[]';

  if (where == 'FIRST') {
    if (mode == 'GET') {
      var code = list + '[0]';
      return [code, Blockly.PHP.ORDER_MEMBER];
    } else if (mode == 'GET_REMOVE') {
      var code = 'array_shift('+list+')';
      return [code, Blockly.PHP.ORDER_MEMBER];
    } else if (mode == 'REMOVE') {
      return 'array_shift('+list+');\n';
    }
  } else if (where == 'LAST') {
    if (mode == 'GET') {
      var code = list + '[count('+list+')-1]';
      return [code, Blockly.PHP.ORDER_MEMBER];
    } else if (mode == 'GET_REMOVE') {
      var code = 'array_pop('+list+')';
      return [code, Blockly.PHP.ORDER_MEMBER];
    } else if (mode == 'REMOVE') {
      return 'array_pop('+list+');\n';
    }
  } else if (where == 'FROM_START') {
    // Blockly uses one-based indicies.
    if (Blockly.isNumber(at)) {
      // If the index is a naked number, decrement it right now.
      at = parseFloat(at);
    } else {
      // If the index is dynamic, decrement it in code.
      at += '-1';
    }
    if (mode == 'GET') {
      var code = list + '[' + at + ']';
      return [code, Blockly.PHP.ORDER_MEMBER];
    } else if (mode == 'GET_REMOVE') {
      var code = 'array_pop(array_splice('+list+', '+at+', 1))';
      return [code, Blockly.PHP.ORDER_FUNCTION_CALL];
    } else if (mode == 'REMOVE') {
      return 'array_splice('+list+', '+at+', 1);\n';
    }
  } else if (where == 'FROM_END') {
    if (mode == 'GET') {
      var code = list+'[ count('+list+')-1-'+at+' ]';
      return [code, Blockly.PHP.ORDER_FUNCTION_CALL];
    } else if (mode == 'GET_REMOVE' ){	  
      var code = 'array_pop(array_splice('+list+', count('+list+')-1-'+at+', 1))';
      return [code, Blockly.PHP.ORDER_FUNCTION_CALL];      
    } else if (mode == 'REMOVE') {
	  return 'array_pop(array_splice('+list+', count('+list+')-1-'+at+', 1));\n';
	}	
  } else if (where == 'RANDOM') {
    var functionName = Blockly.PHP.provideFunction_(
        'lists_get_random_item',
        [ 'function ' + Blockly.PHP.FUNCTION_NAME_PLACEHOLDER_ +
            '(&$list, $remove) {',
          '  $x = array_rand($list);',
          '  if ($remove) {',
          '    return array_pop(array_splice($list, $x, 1));',
          '  } else {',
          '    return $list[$x];',
          '  }',
          '}']);
    code = functionName + '(' + list + ', ' + (mode != 'GET') + ')';
    if (mode == 'GET' || mode == 'GET_REMOVE') {
      return [code, Blockly.PHP.ORDER_FUNCTION_CALL];
    } else if (mode == 'REMOVE') {
      return code + ';\n';
    }
  }
  throw 'Unhandled combination (lists_getIndex).';
};

Blockly.PHP['lists_setIndex'] = function(block) {
  // Set element at index.
  // Note: Until February 2013 this block did not have MODE or WHERE inputs.
  var list = Blockly.PHP.valueToCode(block, 'LIST',
      Blockly.PHP.ORDER_MEMBER) || '[]';  
  var mode = block.getFieldValue('MODE') || 'GET';
  var where = block.getFieldValue('WHERE') || 'FROM_START';
  var at = Blockly.PHP.valueToCode(block, 'AT',
      Blockly.PHP.ORDER_NONE) || '1';
  var value = Blockly.PHP.valueToCode(block, 'TO',
      Blockly.PHP.ORDER_ASSIGNMENT) || 'null';
  // Cache non-trivial values to variables to prevent repeated look-ups.
  // Closure, which accesses and modifies 'list'.
  
  if (where == 'FIRST') {    
    if (mode == 'SET') {
      return list + '[0] = ' + value + ';\n';	  
    } else if (mode == 'INSERT') {
      return 'array_unshift('+list + ', '+value+');\n';	  
    }	
  } else if (where == 'LAST') {  
    if (mode == 'SET') {
      return list + '[ count('+list+')-1 ] = ' + value + ';\n';
	} else if (mode == 'INSERT') {
      return list + '[] = ' + value + ';\n';	  
    }	
  } else if (where == 'FROM_START') {
    // Blockly uses one-based indicies.
    if (Blockly.isNumber(at)) {
      // If the index is a naked number, decrement it right now.
      at = parseFloat(at);
    } else {
      // If the index is dynamic, decrement it in code.
      at += ' - 1';
    }
    if (mode == 'SET') {
      return list + '[' + at + '] = ' + value + ';\n';	  
    } else if (mode == 'INSERT') {
      return 'array_splice('+list+','+at+', 0, '+value+');\n';	  
    }
  } else if (where == 'FROM_END') {
    if (mode == 'SET') {
      return list + ')-1-'+at+ ' ] = ' + value + ';\n';	  
    } else if (mode == 'INSERT') {
      return 'array_splice('+list+', count('+list+')-1-'+at+', 0, '+value+');\n';      
    }
  } else if (where == 'RANDOM') {
    var xVar = '$'+Blockly.PHP.variableDB_.getDistinctName('tmp_x', Blockly.Variables.NAME_TYPE);
    var code = xVar + ' = array_rand('+list+');\n';
    if (mode == 'SET') {	  
      return code + list + '[' + xVar + '] = ' + value + ';\n';
    } else if (mode == 'INSERT') {
      return code + 'array_splice('+list+', '+xVar+', 0, '+value+');\n';
    }	
  }

  throw 'Unhandled combination (lists_setIndex).';
};

Blockly.PHP['lists_getSublist'] = function(block) {
  // Get sublist.
  var list = Blockly.PHP.valueToCode(block, 'LIST',
      Blockly.PHP.ORDER_MEMBER) || '[]';
  var where1 = block.getFieldValue('WHERE1');
  var where2 = block.getFieldValue('WHERE2');
  var at1 = Blockly.PHP.valueToCode(block, 'AT1',
      Blockly.PHP.ORDER_NONE) || '1';
  var at2 = Blockly.PHP.valueToCode(block, 'AT2',
      Blockly.PHP.ORDER_NONE) || '1';
  if (where1 == 'FIRST' && where2 == 'LAST') {
    var code = list ;
  } else {
    var functionName = Blockly.PHP.provideFunction_(
        'lists_get_sublist',
        [ 'function ' + Blockly.PHP.FUNCTION_NAME_PLACEHOLDER_ +
            '($list, $where1, $at1, $where2, $at2) {',
          '  function getAt($list, $where, $at) {',
          '    if ($where == \'FROM_START\') {',
          '      //at--;',
          '    } else if ($where == \'FROM_END\') {',
          '      $at = count($list)-1-$at;',
          '    } else if ($where == \'FIRST\') {',
          '      $at = 0;',
          '    } else if ($where == \'LAST\') {',
          '      $at = count($list)-1;',
          '    } else {',
          '      halt(\'Unhandled option (lists_getSublist).\');',
          '    }',
          '    return $at;',
          '  }',
          '  $at1 = getAt($list, $where1, $at1);',
          '  $at2 = getAt($list, $where2, $at2) + 1;',		  		  
          '  return array_slice($list, $at1, $at2-$at1);',
          '}']);
    var code = functionName + '(' + list + ', \'' +
        where1 + '\', ' + at1 + ', \'' + where2 + '\', ' + at2 + ')';
  }

  return [code, Blockly.PHP.ORDER_FUNCTION_CALL];
};
