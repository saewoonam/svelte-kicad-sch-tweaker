<script>
  import JSZip from './jszip.js'
  import GetSch from "./GetSch.svelte"
  import Editor from "./Editor.svelte"
  import {get_all_sheets, update_raw} from "./kicad.js"
  import { grouped_data } from './store.js';
  import {downloadBlob} from './downloadBlob.js'
  import {saveAs} from 'file-saver'

  // import {fileOpen, fileSave} from "browser-fs-access"
  let sch_idx = -1;
  let files = [];
  let content;
  let grouped={};
  let loaded = false;
  function handleLoaded(event) {
    console.log('handleLoaded', event)
  }
  /*
  $: { if (sch_idx>=0 &&  !loaded) {
  grouped = get_all_sheets(files, sch_idx)
  loaded = true;
    // console.log(grouped)
    //console.log('content', files.accepted[sch_idx].content)
  }}
   */
    function handleSelected(event) {
      let ref_map;
      console.log('file selected', event)
      console.log('sch_idx', sch_idx, 'files', files)
      let results = get_all_sheets(files, sch_idx)
      // console.log(results)
      // console.log('handleSelected, grouped ', grouped)
      grouped_data.set(results)
      loaded = true;
    }
  function status() {
    console.log('updated files, grouped', files, grouped)
  } 
  $: {status()}
  async function zip ()  {
    var zip = new JSZip();
    var folder = zip.folder("files")
    for (let file of files) {
      let updated = update_raw(file)
      if (updated) {
        // console.log(file.name, updated);
        folder.file(file.name, file.raw)
      }
    }
    zip.generateAsync({type:"blob"})
      .then(function(content) {
        saveAs(content, "files.zip");
      });
  }
  function log_json() {
    console.log(JSON.stringify($grouped_data, null, 2));
  }
  function lookup_part() {
    alert('not implemented yet')
  }
  function parts_to_database() {
    //alert('not implemented yet')
    let lines = []
    const parts_dict = $grouped_data
    for (let footprint in parts_dict) {
      for (let value in parts_dict[footprint]) {
        let line = [footprint, value, parts_dict[footprint][value].LCSC, parts_dict[footprint][value].MPN]
        lines.push('"'+line.join('","')+'"\n')
      }
    }
    const blob = new Blob(lines, { type: 'text/csv' })
    downloadBlob(blob, 'database.csv')
  }
  function download() {
    const blob = new Blob([JSON.stringify($grouped_data, null, 2)], {type : 'application/json'});
    downloadBlob(blob,'tweaked.json')
  }
  function open() {
    let myWindow = window.open("?", "", "width=500, height=500");  // Opens a new window
  }
  function update_files() {
    console.log('grouped_data files', $grouped_data['files'])
    for (const file of $grouped_data['files']) {
      let updated = update_raw(file)
      console.log('update raw', file.name, updated)
    }
  }
  /*  random file saving stuff
    // Destructure the one-element array.
    // [fileHandle] = await window.showOpenFilePicker();
    // Do something with the file handle.

    // let jsonBlob = new Blob(['{"name": "test"}'])
    // downloadBlob(jsonBlob, 'myfile.json');
    var blob = new Blob(["Hello, world!"], {type: "text/plain;charset=utf-8"});
    // saveAs(blob, "hello world.txt");
  */
</script>
<h2>Kicad schematic tweaker</h2>
<GetSch bind:files={files} bind:sch_idx={sch_idx} on:selected={handleSelected}/>
{#if sch_idx>=0}
<Editor />
<br>
<!--
<button on:click={open}> window open </button>
<button on:click={log_json}>
  Look at JSON
</button> &nbsp&nbsp&nbsp
<button on:click={download}>
  Download updated json
</button>
<button on:click={update_files}> update raw </button>
-->
<button on:click={zip}> zip </button>
<button on:click={lookup_part}>
  Look up part
</button> &nbsp&nbsp&nbsp
<button on:click={parts_to_database}>
  Save all parts to database / csv
</button>
{/if}

