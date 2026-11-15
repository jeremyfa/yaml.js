var childProcess = require('child_process');
var fs = require('fs');
var os = require('os');
var path = require('path');
var YAML = require('../../lib/Yaml');

describe('Command line input paths', function() {
    var directory;

    beforeEach(function() {
        directory = fs.mkdtempSync(path.join(os.tmpdir(), 'yamljs cli '));
    });

    afterEach(function() {
        ['input.yaml', 'input.json'].forEach(function(name) {
            var filename = path.join(directory, name);
            if (fs.existsSync(filename)) fs.unlinkSync(filename);
        });
        fs.rmdirSync(directory);
    });

    [
        { name: 'yaml2json', extension: 'yaml', input: 'answer: 42\n', output: 'json' },
        { name: 'json2yaml', extension: 'json', input: '{"answer":42}', output: 'yaml' }
    ].forEach(function(program) {
        function run(input, save) {
            var args = [path.resolve(__dirname, '../../bin', program.name)];
            if (save) args.push('--save');
            args.push(input);
            var result = childProcess.spawnSync(process.execPath, args, {
                cwd: directory,
                input: program.input,
                encoding: 'utf8'
            });
            expect(result.error).toBeUndefined();
            expect(result.status).toBe(0);
            expect(result.stderr).toBe('');
            return result.stdout;
        }

        ['absolute', 'relative', 'directory'].forEach(function(kind) {
            it(program.name + ' converts a ' + kind + ' path', function() {
                var filename = path.join(directory, 'input.' + program.extension);
                fs.writeFileSync(filename, program.input);
                var input = kind === 'relative' ? path.basename(filename) :
                    kind === 'directory' ? directory : filename;
                var output = run(input, false);
                expect(YAML.parse(output)).toEqual({ answer: 42 });
            });
        });

        it(program.name + ' saves beside an absolute input path', function() {
            var filename = path.join(directory, 'input.' + program.extension);
            fs.writeFileSync(filename, program.input);
            run(filename, true);
            var output = path.join(directory, 'input.' + program.output);
            expect(fs.existsSync(output)).toBe(true);
            if (fs.existsSync(output)) {
                expect(YAML.parse(fs.readFileSync(output, 'utf8'))).toEqual({ answer: 42 });
            }
        });

        it(program.name + ' keeps the stdin marker', function() {
            expect(YAML.parse(run('-', false))).toEqual({ answer: 42 });
        });
    });
});
