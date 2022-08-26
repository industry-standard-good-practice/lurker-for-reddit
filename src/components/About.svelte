<script>
	import { scale, fade } from 'svelte/transition';
	export let aboutModal = false;
	export let toggleModal;
</script>

{#if aboutModal}
	<div class="modalContainer">
		<div class="modal" transition:scale={{ duration: 400, start: 0.95 }}>
			<h1>What is Lurker?</h1>
			<p>
				Lurker is an answer to the question "What if reddit looked good?" It is built to be
				extremely lightweight, and requires no login. It's completely open-source and free, with no
				ads or analytics tracking whatsoever. The idea is to not have to login, and to... well,
				lurk.
				<br />
				<br />
				Lurker is built in SvelteKit. It's a hobby project, and will likely not recieve major features
				or updates (such as being able to link directly to comments or posts). Buuuut if you want to
				open an issue or request a feature 👇
			</p>
			<a href="https://github.com/industry-standard-good-practice/lurker-for-reddit" target="_blank"
				>Check out the Github</a
			>
			<p>Built with 😍 by <a href="https://www.noahsemus.com" target="_blank">Noah</a></p>
		</div>
		<div class="scrim" on:click={toggleModal} transition:fade />
	</div>
{/if}

<style lang="sass">
	.modalContainer
		position: fixed
		top: 0
		left: 0
		width: 100vw
		height: 100vh
		display: flex
		align-items: center
		justify-content: center
		z-index: 9999

		.modal
			max-width: 550px
			background: var(--background)
			padding: 40px
			border-radius: 16px
			display: flex
			flex-direction: column
			gap: 16px
			z-index: 2

		.scrim
			position: absolute
			top: 0
			left: 0
			width: 100%
			height: 100%
			background: var(--surface-variant)
			opacity: .5
			z-index: 1
			cursor: pointer

	@media (max-width: 900px)
		.modalContainer .modal
			max-width: 90%
			padding: 24px

			h1
				font-size: 24px
</style>
