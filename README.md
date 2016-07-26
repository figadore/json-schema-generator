#JSON Schema Generator

Generate/compile .yaml files (not .yml at the moment) into a single JSON schema file. Resolves references to other schema docuements in the same directory

Requires Node >= 5.0

## Usage

### cli
```
npm install -g @shinymayhem/json-schema-generator

schemagen ./schemas/car.yaml
```

### module
```
var generator = require("@shinymayhem/json-schema-generator");

generator.generate('test/data/car.yaml', function onGenerated(err, schema) {
  if (err) {
    throw err;
  }
  console.log(schema);
});
```

## Examples

### Input
window.yaml
```
---
$schema: http://json-schema.org/draft-04/hyper-schema
id: window
title: Window
strictProperties: true
additionalProperties: false
definitions:
  style:
    type:
      - string
    enum:
      - georgian
      - center bar
type:
  - object
required:
  - size
  - style
properties:
  style:
    $ref: window#/definitions/style
  size:
    $ref: size
```

size.yaml
```
---
$schema: http://json-schema.org/draft-04/hyper-schema
id: size
title: Size
description: Length and width
strictProperties: true
additionalProperties: false
definitions:
  width:
    type: integer
    minimum: 1
    maximum: 100
  height:
    type: integer
    minimum: 1
    maximum: 100
  units:
    type: string
    enum:
      - inches
      - centimeters
type:
  - object
required:
  - width
  - height
  - units
properties:
  height:
    $ref: size#/definitions/height
  width:
    $ref: size#/definitions/width
  units:
    $ref: size#/definitions/units
```

### Run it
```
schemagen ./window.yaml
```

### Output
```
{  
   "$schema":"http://json-schema.org/draft-04/hyper-schema",
   "id":"window",
   "title":"Window",
   "strictProperties":true,
   "additionalProperties":false,
   "definitions":{  
      "style":{  
         "type":[  
            "string"
         ],
         "enum":[  
            "georgian",
            "center bar"
         ]
      },
      "size":{  
         "$schema":"http://json-schema.org/draft-04/hyper-schema",
         "id":"size",
         "title":"Size",
         "description":"Length and width",
         "strictProperties":true,
         "additionalProperties":false,
         "definitions":{  
            "width":{  
               "type":"integer",
               "minimum":1,
               "maximum":100
            },
            "height":{  
               "type":"integer",
               "minimum":1,
               "maximum":100
            },
            "units":{  
               "type":"string",
               "enum":[  
                  "inches",
                  "centimeters"
               ]
            }
         },
         "type":[  
            "object"
         ],
         "required":[  
            "width",
            "height",
            "units"
         ],
         "properties":{  
            "height":{  
               "$ref":"#/definitions/size/definitions/height"
            },
            "width":{  
               "$ref":"#/definitions/size/definitions/width"
            },
            "units":{  
               "$ref":"#/definitions/size/definitions/units"
            }
         }
      }
   },
   "type":[  
      "object"
   ],
   "required":[  
      "size",
      "style"
   ],
   "properties":{  
      "style":{  
         "$ref":"#/definitions/style"
      },
      "size":{  
         "$ref":"#/definitions/size"
      }
   }
}
```

### Valid data
```
{
  "style": "georgian",
  "size": {
    "width": 32,
    "height": 32,
    "units": "inches"
  }
}
```


Alternatively, see 'test/data' dir for example schema files
