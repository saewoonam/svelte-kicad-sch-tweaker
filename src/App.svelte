<script>
	import GetSch from "./GetSch.svelte"
	import Editor from "./Editor.svelte"
	import {get_all_sheets} from "./kicad.js"
	import { grouped_data } from './store.js';

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
		console.log('file selected', event)
		console.log('sch_idx', sch_idx, 'files', files)
		grouped = get_all_sheets(files, sch_idx)
		console.log('handleSelected, grouped ', grouped)
		grouped_data.set(grouped)
		loaded = true;
	}
function status() {
	console.log('updated files, grouped', files, grouped)
}	
	
$: {status()}
</script>
<h2>Kicad schematic parts tweaker</h2>
<GetSch bind:files={files} bind:sch_idx={sch_idx} on:selected={handleSelected}/>
{#if sch_idx>=0}
<Editor />
{/if}
