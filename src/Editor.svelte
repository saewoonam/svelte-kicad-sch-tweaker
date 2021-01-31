<script>
	import test_parts from  './_parts.json';
	import { onDestroy } from 'svelte';
	import { grouped_data } from './store.js';
	import { Input } from 'svelte-chota';

	let parts_dict = test_parts;
	console.log('Editor, parts_dict', parts_dict)
	let footprints = Object.keys(parts_dict)
	let changed = [];

	// let dialog = this.fetch('dialog')

	// let dialog = 'not clicked yet'
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
		parts_dict = value;
		//console.log("data changed, parts_dict", parts_dict)
		footprints = Object.keys(parts_dict).filter(elt => elt != 'filename')
		//reset();
		footprint_idx = -1;
		values = []
		value_idx = -1
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
		parts_dict[footprints[footprint_idx]][values[value_idx]].LCSC = newvalue;
	}
	function set_mpn(event) {
		const newvalue = event.srcElement.value
		console.log('blur lcsc', newvalue)
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
			console.log(footprints[footprint_idx], newkey)
			parts_dict = renameProp(footprints[footprint_idx], newkey, parts_dict)
			console.log('old keys', footprints);
			footprints = Object.keys(parts_dict).filter(elt => elt != 'filename')
			console.log('new keys', footprints);
		}
		if (event.srcElement.id == "Value") {
			console.log(values[value_idx])
		}
	}
	$: { 
		console.log('footprint_idx chnage?', footprint_idx);   
		if (footprint_idx>=0) {
			if (old_footprint_idx != footprint_idx) {
				// console.log('old, new', old_footprint_idx, footprint_idx)
				values = Object.keys(parts_dict[footprints[footprint_idx]])
				// console.log(values)
				// ref_idx = -1;
				clear_value();
			}
			old_footprint_idx = footprint_idx;
		}
	}
	$: {
		// console.log('value_idx', value_idx)
		console.log('value_idx changed?')
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
	function log_json() {
		console.log(JSON.stringify(parts_dict, null, 2));
	}
	function lookup_part() {
		alert('not implemented yet')
	}
	function parts_to_database() {
		//alert('not implemented yet')
		let lines = []
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
		const blob = new Blob([JSON.stringify(parts_dict, null, 2)], {type : 'application/json'});
		downloadBlob(blob,'tweaked.json')
	}
</script>
<style>
	@import "https://unpkg.com/chota@latest";
	.fields {display: inline-block; width: 100px;}
	.centered-select {
		display: flex;
		align-items: center;
	}
</style>
<div class="centered-select">

	<label for="footprint_select" class="fields" >Footprint</label>
	<select id="footprint_select" size=5 bind:value={footprint_idx} style="width:500px;">
		{#each Array.from(footprints.keys()) as id}
		<option value = {id}>
			{footprints[id]}
		</option>
		{/each}
	</select>
	<br>
</div>
<div class="centered-select">
	<label for="value_select" class="fields"> Components</label>
	<select id="value_select" size=5 bind:value={value_idx} style="width:500px;">
		{#each Array.from(values.keys()) as id}
		<option value = {id}>
			{values[id]}
		</option>
		{/each}
	</select>
</div>
<div style="line-height: 200%;">
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
					 values[value_idx] : ''} on:blur={set} on:change={change}>
	</p>	
	<p class="grouped">
		<label class="fields" for="LCSC">LCSC </label>
		<input type="text" id="LCSC" value={fields.LCSC} on:change={set_lcsc}>
	</p>	
	<p class="grouped">
		<label class="fields" for="MPN">MPN</label>
		<input type="text" id="MPN" value={fields.MPN} on:change={set_mpn}>
	</p>
</div>
<button on:click={log_json}>
	Look at JSON
</button> &nbsp&nbsp&nbsp
<button on:click={lookup_part}>
	Look up part
</button> &nbsp&nbsp&nbsp
<button on:click={download}>
	Download updated json
</button>
<button on:click={parts_to_database}>
	Save all parts to database / csv
</button>
