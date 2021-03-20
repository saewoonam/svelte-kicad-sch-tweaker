export function load_sheet(raw) {
    console.log('parse_sheet')
    let contents = [];
    let state = 'waiting';
    let required_fields = ['MPN', 'LCSC']

    let parse_block = 0;
    let block = {};
    let item_index = 0;
    function process_line(line) {
        // console.log(line)
        var pieces = line.match(/(?:[^\s"]+|"[^"]*")+/g);
        // console.log(pieces)

        if (parse_block==0) {
            // console.log(pieces[0])
            switch(pieces[0]) {
                case 'EESchema':
                case 'Connection':
                case 'NoConn':
                case '$EndSCHEMATC':
                    parse_block = 0
                    break;
                case 'LIBS':  // not sure how to process this
                    console.log('got ', pieces[0])
                    break;
                case 'EELAYER':
                case 'Text':
                case 'Wire':
                case 'Entry':
                    parse_block = 1;
                    break;
                case '$Descr':
                case '$Sheet':
                case '$Comp':
                case '$Bitmap':
                    parse_block = 2;
                    break;
                default:
                    console.log('not recognized', pieces[0])
                    parse_block = -1;
            }
            if (parse_block >= 0) {  // handle recognized parts
                // console.log(pieces[0])
                block = {'type':pieces[0], 'lines': [line], 'idx': item_index}
                if (parse_block == 0) contents.push(block)
                item_index += 1;
            } else parse_block = 0; // done handling not recognized
        } else if (parse_block ==1 ) {
            // append line to block
            block['lines'].push(line)
            parse_block = 0;
            contents.push(block)
        } else {
            block['lines'].push(line)
            // check if this is the last line of the block
            if (/^\$End/.test(line)) {
                parse_block = 0;
                contents.push(block)
            }
        }
    }
    for (let line of raw.split(/\r?\n/)) {
        // console.log(line.length, line)
        if (line.length>0) process_line(line)
    }
    console.log('done')
    return contents
}
function process_sheet_content(contents, sheets_to_update, sheet_list) {
    // let grouped = {}
    console.log('mark components')
    // mark items which are components
    for (let item of contents) {
        if (item['type']=='$Comp') {
            for (let line of item['lines']) {
                if (/^F 0/.test(line)) {
                    var pieces = line.match(/(?:[^\s"]+|"[^"]*")+/g);
                    if (!pieces[2].startsWith('"#')) {
                        // console.log(item['idx'], line)
                        item['component'] = true;
                    }
                }
            }
        }
        if (item['type']=='$Sheet') {
            console.log('found sheet')
            // need to consolidate these
            for (let line of item['lines']) {
                // console.log(line)
                if (/^F0/.test(line)) {
                    var pieces = line.match(/(?:[^\s"]+|"[^"]*")+/g);
                    console.log('sheet ID', pieces[1])
                } else if (/^F1/.test(line)) {
                    var pieces = line.match(/(?:[^\s"]+|"[^"]*")+/g);
                    const name = pieces[1].match(/"(.*?)"/)[1]
                    console.log('sheet filename', pieces[1])
                    const index = sheets_to_update.indexOf(name)
                    if (index==-1) sheets_to_update.push(name)
                } else if (/^U /.test(line)) {
                    var pieces = line.match(/(?:[^\s"]+|"[^"]*")+/g);
                    sheet_list.push(pieces[1])
                }
            }
        }
    }
}


export let required_fields = ['MPN', 'LCSC']
function add_field(name, lines) {
    let num_f = 0;
    let newline;
    for (let line of lines) {
        let pieces = line.split(' ');
        if (pieces[0]=='F') num_f++;
        if (pieces[1]=='3') newline = line;
    }
    // fix newline which is a copy of field #3 as a template
    let pieces = newline.match(/(?:[^\s"]+|"[^"]*")+/g);
    pieces[1] = num_f
    pieces[2] = '""'
    newline = pieces.join(' ')
    newline += ' "'+name+'"'
    // console.log('add_field, num_f', num_f)
    const index = lines.findIndex(elt => elt.startsWith("F "+(num_f-1)))
    // console.log('index', index, lines[index])
    lines.splice(index+1, 0, newline)
    // console.log('add_field', lines)
    return lines
}

export function update_field(name, value, lines) {
    let found = false;
    let line_number = 0;
    let pieces;
    let match_line = -1;
    console.log('update_field called', name, value);
    for (let line of lines) {
        pieces = line.match(/(?:[^\s"]+|"[^"]*")+/g);
        // console.log(pieces.length, pieces)
        if (pieces.length==11) { // found custom fields look for name
            if (pieces[10].match(/"(.*?)"/)[1]==name) {
                found = true;
                break;
            }
        }
        if (name == 'Value' && /^F 1 /.test(line)) {
            found = true;
            break
        }
        if (name == 'Footprint' && /^F 2 /.test(line)) {
            found = true;
            break
        }
        line_number++;
    }
    if (found) {
        console.log('update and found', name)
        pieces[2] = '"'+value+'"'
        let newline = pieces.join(' ')
        lines[line_number] = newline;
    }
}

function add_to_group(contents, grouped, ref_map, sheet_name, sheet_ids) {
    let item_idx = 0;
    for (let item of contents) {
        if (item['component']) {
            let num_f = 0;
            let value, footprint;
            let fields_to_add = [...required_fields];
            let extra_fields = {}
            fields_to_add.forEach(elt => extra_fields[elt] = '')
            let references = [];
            for (let line of item['lines']) {
                var pieces = line.match(/(?:[^\s"]+|"[^"]*")+/g);
                if (pieces[0]=='F') num_f++;
                if (/^AR/.test(line)) {
                    const ref = pieces[2].match(/"(.*?)"/)[1];
                    if (!ref.endsWith('?')) {
                        const path = (pieces[1].match(/"(.*?)"/)[1]).split('/').filter(e => e.length > 0);
                        path.splice(-1,1)
                        // console.log(path)
                        // console.log(sheet_ids);
                        let valid_id = true;
                        const reducer = (valid, elt) => valid && sheet_ids.includes(elt);
                        if (path.length>0){
                            valid_id = path.reduce(reducer, valid_id)
                            // console.log('path valid:', valid_id)
                        }
                        if (valid_id) {
                            const index = references.indexOf(ref)
                            if (index==-1) { 
                                references.push(ref);
                                ref_map.push([ref, sheet_name, item_idx])
                            }
                        }
                    }
                }
                if (/^F 0 /.test(line)) {
                    const ref = pieces[2].match(/"(.*?)"/)[1];
                    if (!ref.endsWith('?')) {
                        const index = references.indexOf(ref)
                        if (index==-1) {
                            references.push(ref);
                            ref_map.push([ref, sheet_name, item_idx])
                        }
                    }
                }
                if (/^F 1 /.test(line)) {
                    value = pieces[2].match(/"(.*?)"/)[1];
                    // console.log(value)
                }
                if (/^F 2 /.test(line)) {
                    footprint = pieces[2].match(/"(.*?)"/)[1];
                }
                if (pieces.length==11) {
                    let field = pieces[10].match(/"(.*?)"/)[1];
                    if (field in extra_fields) {
                        // console.log("has", field)
                        extra_fields[field] = pieces[2].match(/"(.*?)"/)[1];
                        const index = fields_to_add.indexOf(field)
                        if (index>-1) fields_to_add.splice(index, 1)  // remove from list to add
                        // console.log('extra_fields left', fields_to_add)
                    }
                }
            }
            // console.log('fields to add', fields_to_add);
            fields_to_add.forEach( elt => {
                item.lines = add_field(elt, item.lines)
                num_f++;
            })

            if (grouped[footprint]) { // footprint is already there
                if(grouped[footprint][value]) { // value is already there
                    grouped[footprint][value]['designator'].push(...references)
                } else { // value is not yet there
                    grouped[footprint][value]={'designator':references}
                    grouped[footprint][value] = {...grouped[footprint][value], ...extra_fields}
                    // grouped[footprint][value].lcsc = extra_fields.lcsc
                    // grouped[footprint][value].mpn = extra_fields.mpn
                }
            } else {  // footprint is not yet there
                grouped[footprint] = {}
                grouped[footprint][value] = {'designator': references}
                grouped[footprint][value] = {...grouped[footprint][value], ...extra_fields}
                // grouped[footprint][value].lcsc = extra_fields.lcsc
                // grouped[footprint][value].mpn = extra_fields.mpn
            }
            // console.log(designator, value, footprint)
            // console.log(item)
        }
        item_idx++;
    }
}
export function get_all_sheets(files, start_idx) {
    console.log('get_all_sheets, files',files)
    let grouped = {}
    let ref_map = []
    let content = load_sheet(files[start_idx].raw)
    // console.log('content', content);
    files[start_idx].content = content
    let sheets_to_process = [];
    let sheet_ids = [];
    process_sheet_content(content, sheets_to_process, sheet_ids);
    add_to_group(content, grouped, ref_map, files[start_idx].name, sheet_ids)
    console.log('sheets_to_update', sheets_to_process)
    while (sheets_to_process.length>0) {
        // const new_name = path.dirname(filename)+path.sep+sheets_to_update.pop()
        const new_name = sheets_to_process.pop()
        console.log('processing  this file', new_name);
        let file = files.filter(elt => elt.name==new_name)[0]
        content = load_sheet(file.raw)
        file.content = content
        process_sheet_content(content, sheets_to_process, sheet_ids);
        add_to_group(content, grouped, ref_map, new_name, sheet_ids)
        console.log('sheets_to_update', sheets_to_process)
    }
    console.log('Done with get_all_sheets')
    // console.log(grouped)
    // console.log('ref_map', ref_map)
    return {'grouped':grouped, 'ref_map':ref_map, 'files':files}
}

export function update_raw(file) {
    if (!("content" in file)) return false;
    file.raw = ""
    for (let object of file.content) {
        file.raw  += object.lines.join("\n");
        file.raw += "\n";
    }
    return true;
}
