<script>
	import Card from '../../../components/Card.svelte';
	import About from '../../../components/About.svelte';
	import * as animateScroll from 'svelte-scrollto';
	import { afterUpdate, onMount } from 'svelte';
	import { inview } from 'svelte-inview';
	import { SpinLine } from 'svelte-loading-spinners';
	import { goto } from '$app/navigation';
	import { fade, scale, fly } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { MasonryGrid } from '@egjs/svelte-grid';
	import { darkMode, sidebarVisible, pinnedSubs, filters } from '../../stores/+server';
	import { browser } from '$app/env';
	import profilePreview from '$lib/assets/profilePreview.png';

	export let data;

	$: ({ subreddit } = data);

	const gap = 24;
	const defaultDirection = 'end';
	const align = 'center';
	const column = 0;
	const columnSize = 0;
	const columnSizeRatio = 0;

	let results = [];
	let activeComments = [];
	let selectFilter;
	let lastResult = '';
	let comments = '';
	const visibleCards = 10;
	let commentsOpen = false;
	let aboutModal = false;
	let innerHeight;
	let innerWidth;
	let root;
	let searchParams = subreddit ? subreddit : '';
	let filterParams = "What's Hot";
	let ready = false;

	$: if (browser) document.body.classList.toggle('scrollDisabled', commentsOpen);

	const fetchData = async () => {
		const response = await fetch(
			`/api${lastResult}/?subreddit=${searchParams}&filter=${filterParams}`
		);
		const serverResults = await response.json();
		results = results.concat(serverResults);
		console.log(results.length);
	};

	const changeFilter = () => {
		filterParams = selectFilter.value;
		gotoPage(subreddit);
	};

	onMount(async () => {
		root = document.querySelector(':root');
		searchParams = subreddit ? subreddit : '';
		fetchData();
		if (localStorage.getItem('firstTime') === null) {
			$pinnedSubs = [{ name: 'all' }];
			localStorage.setItem('firstTime', false);
		}
	});

	afterUpdate(() => {
		if (!$darkMode) {
			root.classList.add('lightMode');
		} else {
			root.classList.remove('lightMode');
		}
		ready = true;
	});

	const reloadFeed = (e) => {
		if (e.detail.inView) {
			lastResult = results.length > 0 ? '/' + results[results.length - 1].name : '';
			fetchData();
		}
	};

	const submitValue = (e) => {
		if (e.key !== 'Enter' || searchParams == '') {
			return;
		}
		if (window.screen.width < 900) {
			$sidebarVisible = false;
		}
		comments = '';
		commentsOpen = false;
		activeComments = [];
		results = [];
		goto(`/l/${searchParams}`);
		fetchData();
	};

	const gotoPage = (page) => {
		if (window.screen.width < 900) {
			$sidebarVisible = false;
		}
		searchParams = page;
		comments = '';
		commentsOpen = false;
		activeComments = [];
		results = [];
		goto(`/l/${searchParams}`);
		fetchData();
		animateScroll.scrollToTop();
	};

	const alreadyPinned = () => {
		return $pinnedSubs.filter((pin) => pin.name == subreddit).length > 0;
	};

	const pinSub = () => {
		$pinnedSubs = [
			...$pinnedSubs,
			{
				name: subreddit
			}
		];
	};

	const unpinSub = () => {
		$pinnedSubs = $pinnedSubs.filter((pin) => pin.name != subreddit);
	};

	const togglePin = () => {
		if (alreadyPinned()) {
			unpinSub();
		} else {
			pinSub();
		}
	};

	const toggleModal = () => {
		aboutModal = !aboutModal;
	};
</script>

<svelte:head>
	<title>lurker</title>
	<meta name="theme-color" content={$darkMode ? '#1c1b1f' : '#FFFBFF'} />
</svelte:head>

<svelte:window bind:innerHeight bind:innerWidth />
{#if ready}
	<main>
		<About {aboutModal} {toggleModal} />
		<div class={$sidebarVisible ? 'leftContent' : 'leftContent hidden'}>
			<h1 class="mobileHide">
				<strong on:click={toggleModal}> lurker </strong>
				for reddit
			</h1>
			<p class="mobileHide">for the introverts out there.</p>
			<div class="form">
				<div class="inputContain subSearch">
					<input
						type="search"
						placeholder={subreddit}
						bind:value={searchParams}
						on:keyup={submitValue}
						onclick="this.select()"
						onblur="this.value = this.defaultValue"
					/>
					<span class="material-symbols-rounded inputIcon"> explore </span>
				</div>
				<button class="pinFAB" on:click={togglePin}>
					<span class="material-symbols-rounded"> push_pin </span>
				</button>
				<div class="inputContain subSort">
					<span class="material-symbols-rounded inputIcon"> arrow_drop_down </span>
					<select
						name="sort"
						id="sortSubreddit"
						on:change={changeFilter}
						bind:this={selectFilter}
					>
						{#each filters as filter}
							<option value={filter}>{filter}</option>
						{/each}
					</select>
				</div>
			</div>
			<div
				class="pinnedContainer"
				on:click={() => {
					$pinnedSubs = $pinnedSubs;
					console.log($pinnedSubs);
				}}
			>
				{#each $pinnedSubs as sub, i (i)}
					<button
						class="pinnedSubreddit"
						on:click={() => gotoPage(sub.name)}
						transition:scale={{ start: 0.8 }}
						animate:flip={{ duration: 400 }}
					>
						<span class="material-symbols-rounded inputIcon"> push_pin </span>
						<span> {sub.name} </span>
					</button>
				{/each}
			</div>
		</div>

		<div class="bottom {$sidebarVisible ? 'sidebarVisibleMobile' : ''}">
			{#if $sidebarVisible}
				<button
					on:click={() => {
						if (!$darkMode) {
							root.classList.remove('lightMode');
						} else {
							root.classList.add('lightMode');
						}
						$darkMode = !$darkMode;
					}}
					transition:scale={{ start: 0.8 }}
				>
					<span class="material-symbols-rounded">
						{$darkMode ? 'dark_mode' : 'light_mode'}
					</span>
					<p class="mobileHide">{$darkMode ? 'Dark Mode: On' : 'Dark Mode: Off'}</p>
				</button>
			{/if}
			{#if (!commentsOpen && window.screen.width < 900) || window.screen.width > 900}
				<button
					on:click={() => {
						$sidebarVisible = !$sidebarVisible;
						console.log($sidebarVisible);
					}}
					transition:scale={{ start: 0.8 }}
					class={$sidebarVisible ? 'hideSidebar' : 'hideSidebar sidebarHidden'}
				>
					<span
						class="material-symbols-rounded {$sidebarVisible ? 'sidebarVisible' : ''}"
					>
						last_page
					</span>
					{#if $sidebarVisible}
						<p transition:fade class="mobileHide">Hide Sidebar</p>
					{/if}
				</button>
			{/if}
		</div>

		<div class={$sidebarVisible ? 'feed sidebarVisible' : 'feed'}>
			{#if window.screen.width < 900}
				<div class="header">
					{#key subreddit}
						<h1 transition:fly={{ duration: 400, x: -40 }}>
							{#if subreddit == 'all'}
								lurker for reddit
							{:else}
								{subreddit}
							{/if}
						</h1>
					{/key}
					<img src={profilePreview} alt="Info Button" on:click={toggleModal} />
				</div>
			{/if}

			{#if results.length == 0}
				<div class="loadingContainer topFeed" transition:fade>
					<div class="loadContent">
						<SpinLine size="40" color="var(--primary)" duration="4s" />
						<span>Loading posts...</span>
					</div>
				</div>
			{/if}

			{#if window.screen.width > 900}
				<MasonryGrid
					class="masonGrid"
					{defaultDirection}
					{gap}
					{align}
					{column}
					{columnSize}
					{columnSizeRatio}
					useResizeObserver="true"
					observeChildren="true"
				>
					{#each results as post, i}
						<div class="cardContainer">
							<Card
								{...post}
								index={i < visibleCards ? i : 0}
								bind:commentsOpen
								cardClass={commentsOpen ? 'disabled' : ''}
								{gotoPage}
								{innerHeight}
								{innerWidth}
								loadComments={async () => {
									comments = results.length > 0 ? '/comment/' + post.id : '';
									const commentsResponse = await fetch(`/api${comments}`);
									const serverResults = await commentsResponse.json();
									activeComments = serverResults.comments;
									return activeComments;
								}}
							/>
						</div>
					{/each}
				</MasonryGrid>
			{:else}
				{#each results as post, i}
					<Card
						{...post}
						index={i < visibleCards ? i : 0}
						bind:commentsOpen
						cardClass={commentsOpen ? 'disabled' : ''}
						{gotoPage}
						{innerHeight}
						{innerWidth}
						loadComments={async () => {
							comments = results.length > 0 ? '/comment/' + post.id : '';
							const commentsResponse = await fetch(`/api${comments}`);
							const serverResults = await commentsResponse.json();
							activeComments = serverResults.comments;
							return activeComments;
						}}
					/>
				{/each}
			{/if}

			{#if results.length != 0}
				<div use:inview={{}} on:change={reloadFeed} id="reloadFeed" />
				<div class="loadingContainer">
					<div class="loadContent">
						<SpinLine size="40" color="var(--primary)" duration="4s" />
						<span>Loading posts...</span>
					</div>
				</div>
			{/if}
		</div>
	</main>
{/if}

<style lang="sass">
	@import url('https://fonts.googleapis.com/css2?family=Public+Sans:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap')

	@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@48,400,0,0')

	:root:not(.lightMode)
		--background: #1c1b1f
		--on-background: #e5e1e5
		--on-primary-container: #e5deff
		--primary-container: #4331a7
		--primary: #c9bfff
		--secondary-container: #474459
		--surface-variant: #47464f
		--neutral-40: #313033
		--neutral-variant: #312F38
		--on-neutral-variant: #E5E0EC
		--shadow: 0px 4px 12px rgba(0, 0, 0, 0.25)

	:root.lightMode
		--background: #FFFBFF
		--on-background: #1C1B1F
		--on-primary-container: #160067
		--primary-container: #E5DEFF
		--primary: #5B4CBF
		--secondary-container: #E5DFF9
		--surface-variant: #E5E0EC
		--neutral-40: #E5E1E5
		--neutral-variant: #E5E0EC
		--on-neutral-variant: #312F38
		--shadow: 0px 4px 12px -4px rgba(0, 0, 0, 0.5)

	:global(*)
		margin: 0
		padding: 0
		box-sizing: border-box
		font-family: 'Public Sans', sans-serif

		&::-webkit-scrollbar
			width: 10px

		&::-webkit-scrollbar-track
			background: var(--background)

		&::-webkit-scrollbar-thumb
			background: var(--neutral-variant)
			border-radius: 20px

	:global(::selection)
		background: var(--primary-container)

	:global(body), :global(html)
		background: var(--background)
		color: var(--on-background)
		height: 100vh
		overflow-y: auto
		overflow-x: hidden

		&::-webkit-scrollbar
			display: block

	:global(.scrollDisabled)
		overflow: hidden

	:global(.material-symbols-rounded)
		user-select: none
		transition: color .4s ease

	:global(button), :global(.linkButton)
		max-width: 200px
		font-size: 14px
		line-height: 20px
		letter-spacing: 0.1px
		background: var(--neutral-variant)
		color: var(--on-neutral-variant)
		outline: none
		border: none
		padding: 8px 16px
		border-radius: 8px
		cursor: pointer
		display: flex
		align-items: center
		justify-content: flex-start
		gap: 8px
		white-space: nowrap
		transition: transform .2s cubic-bezier(.57,.56,.29,3), max-width .4s ease
		overflow: hidden
		text-decoration: none

		:global(svg)
			fill: var(--primary)
			width: 18px
			height: 18px
			margin-left: -6px
			transform: translateY(-1px)

		:global(.material-symbols-rounded)
			font-size: 20px
			color: var(--primary)
			margin-left: -6px
			transition: transform .4s cubic-bezier(0.620, 0.020, 0.310, 0.990)

			&.sidebarVisible
				transform: rotate(180deg)

		&:active
			transform: scale(.95)

		&.sidebarHidden
			max-width: 40px

		&.pinnedSubreddit
			border-radius: 20px
			background: var(--secondary-container)
			color: var(--on-background)

	:global(a)
		color: var(--primary)

	:global(.copyButton)
		background: var(--neutral-variant) !important

	:global(.bp-wrap > div:first-child)
		background: var(--background)

	:global(.bp-wrap.bp-inline > div:first-child)
		background: var(--neutral-variant)

	:global(.bp-wrap.bp-inline .bp-count)
		background: var(--background)
		margin: 16px
		padding: 8px 16px

	:global(.bp-wrap .bp-inner .bp-img)
		background-size: contain
		background-repeat: no-repeat
		background-position: center

	:global(.bp-wrap .bp-inner .bp-img img)
		object-fit: contain

	:global(.bp-controls button)
		background: var(--primary)
		color: var(--background)
		right: auto
		left: 24px
		top: 24px
		width: 48px
		height: 48px
		border-radius: 24px
		display: flex
		align-items: center
		justify-content: center
		padding: 0

		&:hover
			background: var(--primary)

		&::before
			position: relative
			font-family: 'Material Symbols Rounded'
			content: 'arrow_forward'
			font-size: 20px
			width: 20px
			height: 20px
			line-height: 20px
			top: auto
			right: auto

	:global(.bp-controls button.bp-next),
	:global(.bp-controls button.bp-prev)
		right: 24px
		top: 50%
		transform: translateY(-50%)
		left: auto
		margin-top: 0

		&::before
			left: 0
			transform: translateX(0) !important

	:global(.bp-controls button.bp-prev)
		right: auto
		left: 24px

		&::before
			transform: rotate(180deg) !important

	:global(.bp-controls .bp-x::before)
		content: 'close'

	:global(.bp-count)
		color: var(--on-neutral-variant)
		right: 0
		margin: 24px
		background: var(--neutral-variant)
		border-radius: 8px
		display: flex
		align-items: center
		justify-content: center
		width: auto
		height: auto
		padding: 16px

	main
		position: relative
		display: flex
		width: 100vw

	input, select
		background: var(--surface-variant)
		outline: none
		border: none
		font-size: 14px
		line-height: 20px
		padding: 12px 16px
		padding-right: 44px
		border-radius: 12px
		color: var(--on-background)
		cursor: pointer
		text-transform: lowercase

	input[type='search']
		width: 225px

		&::selection
			background: var(--primary)

		&:focus
			background: var(--on-background)
			color: var(--background)
			cursor: text

		&:focus + span
			color: var(--primary-container) !important

		&::placeholder
			color: var(--on-background)

	.header
		position: relative
		min-height: 150px
		width: 100%

		h1
			position: absolute
			bottom: 0
			left: 16px

		img
			position: absolute
			top: 16px
			left: 16px
			width: 36px
			height: 36px
			display: flex
			align-items: center
			justify-content: center

	.leftContent
		position: fixed
		top: 0
		left: 0
		z-index: 20
		width: 400px
		height: 100vh
		min-width: 400px
		padding: 60px
		display: flex
		flex-direction: column
		user-select: none
		white-space: nowrap
		transition: all .75s cubic-bezier(0.620, 0.020, 0.310, 0.990)

		&.hidden
			transform: translateX(-20px)
			opacity: 0
			width: 0px
			min-width: 0px
			padding: 60px 0

		h1
			font-weight: 500
			font-size: 36px
			line-height: 44px
			margin-bottom: 8px

			strong
				border-bottom: 2px solid var(--primary)
				color: var(--primary)
				cursor: pointer

		.form
			position: relative
			display: flex
			flex-direction: column
			gap: 8px
			align-items: flex-start
			margin-top: 16px

			.inputContain
				position: relative
				transition: transform .225s cubic-bezier(.57,.56,.29,3)
				cursor: pointer

				&:active
					transform: scale(.98)

			.inputIcon
				position: absolute
				top: 10px
				right: 16px
				color: var(--primary)
				z-index: 2

			select
				-webkit-appearance: none

			input[type='search']::-webkit-search-cancel-button
				display: none

	.pinnedContainer
		align-self: stretch
		flex-grow: 1
		display: flex
		flex-direction: column
		align-items: flex-start
		justify-content: center
		padding-top: 16px
		padding-bottom: 96px
		gap: 8px

	.pinFAB
		position: absolute
		top: 2px
		left: 236px
		width: 40px
		height: 40px
		border-radius: 40px
		background: var(--primary-container)
		color: var(--on-primary-container)
		justify-content: center

		span
			margin: 0

	.bottom
		position: fixed
		bottom: 60px
		left: 60px
		display: flex
		flex-direction: column
		align-items: flex-start
		gap: 8px
		z-index: 20

		button
			background: var(--surface-variant)
			color: var(--on-background)

	.feed
		position: relative
		height: fit-content
		flex-grow: 1
		padding: 60px
		transition: padding .6s ease

		&.sidebarVisible
			padding-left: 400px

		.cardContainer
			max-width: 100%
			transition: all .8s ease

	:global(.masonGrid)
		min-height: 110vh
		display: flex
		flex-direction: column
		align-items: center
		justify-content: flex-start

	#reloadFeed
		position: absolute
		bottom: 500vh
		z-index: 9
		width: 100%
		height: 100px

	:global(.loadingContainer)
		width: 100%
		height: 80vh
		display: flex
		padding: 40px
		align-items: flex-start
		justify-content: center
		gap: 8px

		&.topFeed
			position: absolute
			z-index: -1
			width: auto

		:global(.loadContent)
			display: flex
			align-items: center

	@media (max-width: 900px)
		:global(*), :global(html), :global(body)
			-webkit-tap-highlight-color: transparent

			&::-webkit-scrollbar
				display: none

		:global(.mobileHide)
			display: none

		.loadingContainer
			padding-top: 166px

		input[type="search"]::-webkit-search-decoration,
		input[type="search"]::-webkit-search-cancel-button,
		input[type="search"]::-webkit-search-results-button,
		input[type="search"]::-webkit-search-results-decoration
			display: none

		:global(button), :global(.linkButton)
			font-size: 11px
			letter-spacing: .5px

		.leftContent
			background: var(--background)
			border: 1px solid var(--neutral-40)
			border-radius: 16px 16px 0 0
			box-sizing: content-box
			z-index: 9
			width: 100vw
			height: min-content
			min-width: auto
			top: auto
			left: -1px
			bottom: -1px
			padding: 0
			box-shadow: var(--shadow)

			&.hidden
				transform: translateY(300px)
				opacity: 1
				width: 100vw
				min-width: 0px
				padding: 0

			.pinFAB
				top: 8px
				left: 16px
				width: 44px
				height: 44px

			h1, p
				padding: 0 16px

			.form
				padding: 8px 16px 0px 68px
				flex-direction: row

				.subSearch
					width: calc( 100% - 54px )

					input
						width: 100%

			.pinnedContainer
				padding: 16px
				padding-bottom: 32px
				flex-direction: row
				overflow-x: auto
				justify-content: flex-start

				button
					min-width: min-content
					text-transform: lowercase

			h1
				font-size: 24px
				line-height: 28px
				padding-top: 16px

		.feed
			padding: 0
			gap: 0
			width: 100%
			transition: padding .4s ease

			&.sidebarVisible
				padding: 0

		.bottom
			flex-direction: row
			left: auto
			right: 24px
			bottom: 24px
			z-index: 99
			transition: bottom .75s cubic-bezier(0.620, 0.020, 0.310, 0.990)

			&.sidebarVisibleMobile
				bottom: 168px

			button
				width: 56px
				min-width: 56px
				height: 56px
				padding: 0
				align-items: center
				justify-content: center
				border-radius: 16px
				background: var(--primary)
				box-shadow: var(--shadow)

				span
					color: var(--background)
					margin-left: 0

			.hideSidebar .material-symbols-rounded
				transform: rotate(-90deg)

				&.sidebarVisible
					transform: rotate(90deg)
</style>
