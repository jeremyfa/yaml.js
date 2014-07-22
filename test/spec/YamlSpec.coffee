
unless YAML?
    YAML = require '../../src/Yaml'


describe 'YAML Parser', ->


    it 'parses simple sequence', ->

        expect YAML.parse '''
        - apple
        - banana
        - carrot
        '''
        .toEqual ['apple', 'banana', 'carrot']


    it 'parses nested sequences', ->

        expect YAML.parse '''
        -
         - foo
         - bar
         - baz
        '''
        .toEqual [['foo', 'bar', 'baz']]


    it 'parses mixed sequences', ->

        expect YAML.parse '''
        - apple
        -
         - foo
         - bar
         - x123
        - banana
        - carrot
        '''
        .toEqual ['apple', ['foo', 'bar', 'x123'], 'banana', 'carrot']


    it 'parses deeply nested sequences', ->

        expect YAML.parse '''
        -
         -
          - uno
          - dos
        '''
        .toEqual [[['uno', 'dos']]]


    it 'parses simple mapping', ->

        expect YAML.parse '''
        foo: whatever
        bar: stuff
        '''
        .toEqual foo: 'whatever', bar: 'stuff'


    it 'parses sequence in a mapping', ->

        expect YAML.parse '''
        foo: whatever
        bar:
         - uno
         - dos
        '''
        .toEqual foo: 'whatever', bar: ['uno', 'dos']




