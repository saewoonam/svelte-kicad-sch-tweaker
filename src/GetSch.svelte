<style>
  @import "https://unpkg.com/chota@latest";
</style>
<script>
  // import Dropzone from "svelte-file-dropzone";
  import { createEventDispatcher } from 'svelte';
  import { Modal, Button, Card } from 'svelte-chota';
  let modal_open = false;
  let modal_data;
  const modal_show = event => modal_open = true;
  const modal_hide = event => modal_open = false;
  const dispatch = createEventDispatcher();
  export let sch_idx = -1;
  export let files = [];
  let fileList = [];

  function handleFilesSelect(e) {
    const { acceptedFiles, fileRejections } = e.detail;
    files.accepted = acceptedFiles.filter(elt=> elt.name.endsWith('.sch'))
    // console.log(e)
    // files.accepted = [...files.accepted, ...acceptedFiles];
    //files.rejected = [...files.rejected, ...fileRejections];
  }
  function readFiles(files) {
    if (files.length > 0) {
      clear_sch();
    }
    // console.log(files.accepted)
    for (const file of files) {
      console.log(file.name)
      var reader = new FileReader();
      // await reader.readAsArrayBuffer(file);
      reader.readAsText(file);

      reader.onload = function(event) {
        // console.log('reader.onload');
        file.raw = event.target.result
        // console.log(event.target.result.length);
        // console.log(event.target.result.byteLength);
        // console.log(reader.result.byteLength);
        // console.log(reader.result.toString());
      };

      reader.onerror = function() {
        console.log(reader.error);
      };
    }
    //console.log(reader)
    // console.log(files)
  }
  function clear_sch() {
    let elt = document.getElementById("sch_select")
    if (elt) elt.selectedIndex=-1;
    sch_idx = -1
  }
  //$: console.log(sch_idx)
  function click() {
    let input = document.getElementById("fileInput");
    input.click()
  }
  function blur() {
    console.log('blur')
  }
  function change() {
    if (fileList.length>0) {
      console.log('change')
      sch_idx = -1;
      files = Array.from(fileList)
      readFiles(files)
      dispatch('loaded', {})
      modal_open = true;
    }
    console.log('change', files, files.keys())
  }
  function handleSelect(event) {
    console.log('handle file select')
    dispatch('selected',{})
  }
  function handleSelectBlur(event) {
    console.log('handle file blur')
    //dispatch('selected',{})
  }
</script>
<p class="grouped">
  <input type="file" id="fileInput" bind:files={fileList}
         accept=".sch" multiple style="display:none;" on:blur={blur} on:change={change}>
  <Button primary on:click={click}>
    Load new schematic
  </Button>

  {#if files.length>0}
    <select id="sch_select" size=1 bind:value={sch_idx} style="width:200px;" on:change={handleSelect} on:blur={handleSelectBlur}>
      {#each Array.from(files.keys()) as id}
        <option value = {id}>
          {files[id].name}
        </option>
      {/each}
    </select>
  {/if}
</p>
<Modal bind:open={modal_open}>
  <Card>
    <h4 slot="header">Select Root schematic</h4>

    <select id="sch_select" size=5 bind:value={sch_idx} style="width:200px;" on:change={handleSelect} on:blur={handleSelectBlur}>
      {#if files.length>0}
      {#each Array.from(files.keys()) as id}
      <option value = {id}>
        {files[id].name}
      </option>
      {/each}
      {/if}
    </select>
    <div slot="footer" class="is-right">
      <Button primary on:click={modal_hide}>Done</Button>
    </div>
  </Card>
</Modal>
