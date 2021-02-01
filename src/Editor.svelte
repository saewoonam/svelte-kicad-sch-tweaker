<script>
  // import test_parts from  './_parts.json';
  import { onDestroy } from 'svelte';
  import { grouped_data } from './store.js';
  import { Input, Card } from 'svelte-chota';
  import { update_field } from './kicad.js';

  let parts_dict;
  //= test_parts;
  console.log('Editor, parts_dict', parts_dict)
  let ref_map;
  let footprints = []; // = Object.keys(parts_dict)
  let changed = [];

  let footprint_idx=-1;
  let old_footprint_idx = -1;
  let value_idx;
  let values = [];
  let refs=''
  let fields = {LCSC:'', MPN:'', refs:''}

  let renameProp = (oldProp, newProp, { [oldProp]: old, ...others }) => ({
    [newProp]: old,
    ...others
  })
  const unsubscribe = grouped_data.subscribe(value => {
    // console.log('value in subscribe', value);
    parts_dict = value['grouped'];
    if (parts_dict) {
      footprints = Object.keys(parts_dict).filter(elt => elt != 'filename');
      footprint_idx = -1;
      values = []
      value_idx = -1
      ref_map = value['ref_map']
      console.log('ref_map', ref_map)
    }
  });
  onDestroy(unsubscribe);

  function reset() {
    clear_value()
    footprint_idx = -1;
  }
  function clear_value() {
    document.getElementById("value_select").selectedIndex=-1;
    value_idx = -1
  }
  function set_lcsc(event) {
    const newvalue = event.srcElement.value
    console.log('blur lcsc', newvalue)
    console.log('grouped_data', $grouped_data)
    console.log('parts_dict', parts_dict[footprints[footprint_idx]])
    parts_dict[footprints[footprint_idx]][values[value_idx]].LCSC = newvalue;
  }
  function set_mpn(event) {
    const newvalue = event.srcElement.value
    console.log('blur mpn', newvalue)
    parts_dict[footprints[footprint_idx]][values[value_idx]].MPN = newvalue;
    console.log('blur mpn')
  }
  function set(event) {
    console.log('set', event)
    if (event.srcElement.id == "Footprint") {
      console.log(footprints[footprint_idx])
    }
    if (event.srcElement.id == "Value") {
      console.log(values[value_idx])
    }
  }
  function change(event) {
    console.log('change', event)
    let newkey = event.srcElement.value

    if (event.srcElement.id == "Footprint") {
      console.log('change footprint', footprints[footprint_idx], newkey)
      const oldkey = footprints[footprint_idx]
      const oldvalue = values[value_idx]
      if (newkey in parts_dict) {
        // just move part into new footprint dictionary
        // TODO check if new value already exists and deal with that
        // for now just create new value key in the footprint
        parts_dict[newkey][values[value_idx]] = parts_dict[oldkey][values[value_idx]]
        delete parts_dict[oldkey][values[value_idx]]
      } else {
        parts_dict[newkey]={}
        parts_dict[newkey][values[value_idx]] = parts_dict[oldkey][values[value_idx]]
        delete parts_dict[oldkey][values[value_idx]]
      }
      console.log('old keys', footprints);
      footprints = Object.keys(parts_dict).filter(elt => elt != 'filename')
      console.log('new keys', footprints);
      footprint_idx = footprints.indexOf(newkey)
      old_footprint_idx = footprint_idx;
      values = Object.keys(parts_dict[footprints[footprint_idx]])
      value_idx = values.indexOf(oldvalue)
      console.log('footprint_idx, value_idx', footprint_idx, value_idx)
    }
    if (event.srcElement.id == "Value") {
      console.log('old value', values[value_idx], 'new', newkey)
      if (newkey in parts_dict[footprints[footprint_idx]]) {
        // merge
        alert("Merge is not implemented")
      } else { // new value, create object
        parts_dict[footprints[footprint_idx]] = renameProp(values[value_idx], newkey, parts_dict[footprints[footprint_idx]])
        values = Object.keys(parts_dict[footprints[footprint_idx]])
        value_idx = values.indexOf(newkey)
      }
    }
  }
  $: {
    // disabled = footprint_idx < 0 || value_idx < 0;
    console.log('disabled, footprint, value idx', footprint_idx, value_idx);
  }
  $: { 
    console.log('footprint_idx chnage?', footprint_idx);   
    if (footprint_idx>=0) {
      if (old_footprint_idx != footprint_idx) {
        values = Object.keys(parts_dict[footprints[footprint_idx]])
        clear_value();
      }
      old_footprint_idx = footprint_idx;
    }
  }
  $: {
    // console.log('value_idx', value_idx)
    console.log('value_idx changed?', value_idx)
    // disabled = footprint_idx < 0 || value_idx < 0;
    if (value_idx>-1) {
      //console.log(parts_dict[footprints[footprint_idx]][values[value_idx]])
      fields.LCSC = parts_dict[footprints[footprint_idx]][values[value_idx]].LCSC
      fields.MPN = parts_dict[footprints[footprint_idx]][values[value_idx]].MPN
      fields.refs = parts_dict[footprints[footprint_idx]][values[value_idx]].designator
    } else {
      fields.LCSC = ''
      fields.MPN = ''
      fields.refs = ''
    }
  }
</script>
<style>
  @import "https://unpkg.com/chota@latest";
  .fields {display: inline-block; width: 120px;}
  .centered-select {
    display: flex;
    align-items: center;
  }
  p {
    height:30px;
    margin-bottom: 0px;
  }
</style>
<div class="card">
<div class="centered-select grouped">

  <label for="footprint_select" class="fields" >Footprint</label>
  <select id="footprint_select" size=5 bind:value={footprint_idx} >
    {#if footprints}
      {#each Array.from(footprints.keys()) as id}
        <option value = {id}>
          {footprints[id]}
        </option>
      {/each}
    {/if}
  </select>
</div>
<div class="centered-select grouped">
  <label for="value_select" class="fields"> Components</label>
  <select id="value_select" size=5 bind:value={value_idx}>
    {#each Array.from(values.keys()) as id}
    <option value = {id}>
      {values[id]}
    </option>
    {/each}
  </select>
</div>
<div>
  <p class="grouped"> 
    <label class="fields" for="refs"> References</label> 
    <input id="refs" type="text" value={fields.refs} readonly="readonly" style='background: lightgrey;'>
  </p>
  <p class="grouped">
    <label class="fields" for="Footprint">Footprint </label>
    <input type="text" class="fields-input" id="Footprint" value= {footprints[footprint_idx] ?
           footprints[footprint_idx] : ''} on:blur={set} on:change={change} >
  </p>  
  <p class="grouped">
    <label class="fields" for="Value">Value </label>
    <input type="text" id="Value" value= {values[value_idx] ?
      values[value_idx] : ''} on:blur={set} on:change={change} disabled={value_idx<0}>
  </p>  
  <p class="grouped">
    <label class="fields" for="LCSC">LCSC </label>
    <input type="text" id="LCSC" value={fields.LCSC} on:change={set_lcsc} disabled={value_idx<0 || footprint_idx<0}>
  </p>  
  <p class="grouped">
    <label class="fields" for="MPN">MPN</label>
    <input type="text" id="MPN" value={fields.MPN} on:change={set_mpn} disabled={value_idx<0 || footprint_idx<0}>
  </p>
</div>
</div>
