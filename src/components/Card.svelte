<script>
	import { scale, fade, slide, fly } from 'svelte/transition';
	import { cubicOut, cubicInOut, cubicIn } from 'svelte/easing';
	import { SpinLine } from 'svelte-loading-spinners';
	import BiggerPicture from 'bigger-picture/svelte';
	import 'bigger-picture/dist/bigger-picture.css';
	import * as animateScroll from 'svelte-scrollto';
	import moment from 'moment';
	import Comment from './Comment.svelte';
	import linkPreview from '$lib/assets/linkPreview.png';
	import profilePreview from '$lib/assets/profilePreview.png';
	import { afterUpdate, onMount } from 'svelte';

	let lightbox = false;
	export let subreddit_name_prefixed;
	export let title;
	export let score;
	export let num_comments;
	export let url;
	export let post_hint;
	export let id;
	export let author;
	export let created_utc;
	export let index;
	export let loadComments;
	export let commentsOpen = false;
	export let cardClass;
	export let innerHeight;
	export let innerWidth;
	export let selftext_html;
	export let media;
	export let preview;
	export let domain;
	export let is_gallery;
	export let media_metadata;
	export let gallery_data;
	export let permalink;
	export let gotoPage;
	export let link_flair_richtext;
	export let link_flair_type;
	export let link_flair_text;
	export let is_self;
	export let is_video;
	export let author_flair_richtext;
	export let author_flair_text;
	export let author_flair_type;
	export let over_18;
	export let updateGrid = () => {};

	let galleryImage;
	let galleryContainer;
	let root;
	let clientHeight;
	let halfInnerHeight = (innerHeight / 2) * -1;
	let promise;
	let commentsVisible = false;
	let uploadDate = new Date(created_utc * 1000);

	const videos = document.querySelectorAll('video');
	videos.forEach((video) => {
		video.disableRemotePlayback;
	});

	onMount(() => {
		galleryImage = root.querySelectorAll('#galleryContainer > .galleryItem > a');
		galleryContainer = root.querySelector('#galleryContainer');
	});

	afterUpdate(() => {
		if (is_gallery) {
			let bpGallery = BiggerPicture({
				target: galleryContainer
			});

			let galleryItems = gallery_data.items;
			let items = [];
			galleryItems.forEach((item) => {
				Object.keys(media_metadata).forEach((key) => {
					if (key === item.media_id) {
						items.push({
							img: media_metadata[key].p[media_metadata[key].p.length - 1].u,
							width: media_metadata[key].p[media_metadata[key].p.length - 1].x,
							height: media_metadata[key].p[media_metadata[key].p.length - 1].y
						});
					}
				});
			});

			bpGallery.open({
				items,
				inline: true,
				scale: 1,
				noClose: true,
				noPinch: (container) => container.clientWidth < 900,
				onImageClick(inlineContainer, activeItem) {
					if (inlineContainer.clientWidth >= 800) {
						return;
					}
					const bpImg = inlineContainer.querySelector('.bp-img');
					let newInstanceContainer;
					new BiggerPicture({ target: document.body }).open({
						items: items.map((item) => ({
							...item,
							element: bpImg
						})),
						position: activeItem.i,
						onOpen(newContainer) {
							newInstanceContainer = newContainer;
							inlineContainer.classList.add('hide-controls');
						},
						onClose() {
							let thumb = bpImg.firstChild?.currentSrc ?? activeItem.thumb;
							let newInstanceBpImg = newInstanceContainer.querySelector('.bp-img');
							newInstanceBpImg.style.backgroundImage = `url(${thumb})`;
						},
						onClosed: () => inlineContainer.classList.remove('hide-controls')
					});
					return true;
				}
			});
		}
	});

	function kFormatter(num) {
		return Math.abs(num) > 999
			? Math.sign(num) * (Math.abs(num) / 1000).toFixed(1) + 'k'
			: Math.sign(num) * Math.abs(num);
	}

	animateScroll.setGlobalOptions({
		container: '.feed'
	});

	const closeComment = () => {
		commentsVisible = false;
		commentsOpen = false;
		promise = '';
		animateScroll.scrollTo({
			element: `#${id}`,
			offset: halfInnerHeight + (clientHeight / 2 + 20)
		});
		setTimeout(updateGrid, 450);
	};

	const openComment = () => {
		promise = loadComments();
		commentsVisible = true;
		commentsOpen = true;
		if (innerWidth > 900) {
			animateScroll.scrollTo({ element: `#${id}`, offset: -60 });
		} else {
			animateScroll.scrollTo({ element: `#${id}`, offset: 0 });
		}
	};

	function iOS() {
		return (
			[
				'iPad Simulator',
				'iPhone Simulator',
				'iPod Simulator',
				'iPad',
				'iPhone',
				'iPod'
			].includes(navigator.platform) ||
			// iPad on iOS 13 detection
			(navigator.userAgent.includes('Mac') && 'ontouchend' in document)
		);
	}

	let bp = BiggerPicture({
		target: document.body
	});

	function openImage(e) {
		e.preventDefault();
		bp.open({
			items: [
				{
					img: url,
					element: e.currentTarget,
					width: preview ? preview.images[0].source.width : '3000',
					height: preview ? preview.images[0].source.height : '3000',
					thumb: url
				}
			],
			el: e.currentTarget
		});
	}

	function openVideo(e) {
		e.preventDefault();
		bp.open({
			items: [
				{
					sources: [{ src: media.reddit_video.fallback_url, type: 'video/mp4' }],
					width: media.reddit_video.width,
					height: media.reddit_video.height
				}
			],
			el: e.currentTarget
		});
	}
</script>

<div
	class={commentsVisible ? 'card commentsVisible' : `card ${cardClass}`}
	in:scale|local={{
		duration: 500,
		start: 0.8,
		easing: cubicOut,
		delay: index * 200
	}}
	out:scale|local={{
		duration: 500,
		start: 0.8,
		easing: cubicIn
	}}
	{id}
	bind:this={root}
>
	{#if commentsVisible}
		<div
			class="backButton"
			on:click={() => {
				if (commentsVisible) {
					closeComment();
				}
			}}
			in:scale={{ start: 0.75 }}
			out:fade={{ duration: 400 }}
		>
			<span class="material-symbols-rounded"> arrow_back </span>
		</div>
	{/if}
	<div class="scrollContainer">
		<div class="postContainer" bind:clientHeight>
			<div class={commentsVisible ? 'text commentsVisible' : 'text'}>
				<div class="metaInfo">
					<p
						on:click={() => gotoPage(subreddit_name_prefixed.replace('r/', ''))}
						class="subreddit"
					>
						{subreddit_name_prefixed}
					</p>
					<div class="postAuthor">
						<p><span class="mobileHide">posted by </span>u/{author}</p>
						{#if author_flair_type === 'richtext'}
							<div class="flair">
								{#if author_flair_richtext[0].u}
									{#each author_flair_richtext as flair}
										{#if flair.t}
											<span>{flair.t}</span>
										{/if}
									{/each}
									{#each author_flair_richtext as flair}
										{#if flair.u}
											<img src={flair.u} alt="user flair" title={flair.a} />
										{/if}
									{/each}
								{:else}
									<span>{author_flair_richtext[0].t}</span>
								{/if}
							</div>
						{:else if author_flair_type === 'text' && author_flair_text}
							<div class="flair">
								<span>{author_flair_text}</span>
							</div>
						{/if}
					</div>
					<p class="postDate">{moment(uploadDate).fromNow()}</p>
				</div>
				<h1
					on:click={() => {
						if (commentsVisible) {
							closeComment();
						} else {
							openComment();
						}
					}}
				>
					{title}
				</h1>
			</div>
			{#if link_flair_type}
				{#if link_flair_type === 'richtext'}
					<div class="flair">
						{#each link_flair_richtext as flair}
							{#if flair.e === 'text'}
								<span>{flair.t}</span>
							{/if}
							{#if flair.e === 'emoji'}
								<img src={flair.u} alt="link flair emoji" title={flair.a} />
							{/if}
						{/each}
					</div>
				{:else if link_flair_type === 'text' && link_flair_text}
					<div class="flair">
						<span>{link_flair_text}</span>
					</div>
				{/if}
			{/if}
			<div class="buttons">
				<button>{kFormatter(score)} <span class="mobileHide">Points</span></button>
				<button
					on:click={() => {
						if (commentsVisible) {
							closeComment();
						} else {
							openComment();
						}
					}}
				>
					<span class="material-symbols-rounded"> chat_bubble </span>
					<p>
						{kFormatter(num_comments)} <span class="mobileHide">Comments</span>
					</p>
				</button>
				<a href="https://reddit.com{permalink}" target="_blank" class="linkButton">
					<span class="material-symbols-rounded"> open_in_new </span>
					<p>Open in Reddit</p>
				</a>
			</div>

			<!-- Image Logic -->

			{#if post_hint === 'image' || domain === 'i.redd.it' || domain === 'i.imgur.com'}
				<div class="imgContainer">
					<a href={url} on:click={openImage} target="_blank">
						<img
							src={url}
							alt="reddit post"
							class={over_18 ? 'nsfw' : ''}
							loading="lazy"
						/>
					</a>
				</div>
			{:else if is_gallery}
				<div id="galleryContainer" class="imgContainer" />
			{:else if post_hint === 'rich:video' || domain == 'streamable.com'}
				<div class="videoContain {over_18 ? 'nsfw' : ''}">
					{#if over_18}
						<div
							class="nsfwOverlay {lightbox ? 'lightbox' : ''}"
							on:click={() => (lightbox = !lightbox)}
						/>
					{/if}
					{@html media.oembed.html}
				</div>
			{:else if (post_hint === 'link' && domain !== 'twitter.com') || (!post_hint && !is_self && !is_video && domain !== 'twitter.com') || (domain === 'twitter.com' && !media)}
				<a class="imgContainer" href={url} target="_blank">
					<img
						src={preview ? preview.images[0].source.url : linkPreview}
						alt="Thumbnail from website link"
						in:scale={{ start: 0.75 }}
						class={over_18 ? 'linkImage nsfw' : 'linkImage'}
						loading="lazy"
					/>
					<span>{domain}</span>
				</a>
			{:else if post_hint === 'hosted:video' || is_video}
				<div class="imgContainer">
					{#if iOS() == false}
						<a href={media.reddit_video.fallback_url} on:click={openVideo}>
							<video
								src={media.reddit_video.fallback_url}
								autoplay
								loop
								muted
								class={over_18 ? 'nsfw' : ''}
							/>
						</a>
					{:else}
						<video
							src={media.reddit_video.fallback_url}
							autoplay
							loop
							muted
							playsinline
							controls
							class={over_18 ? 'nsfw' : ''}
						/>
					{/if}
				</div>
			{:else if domain === 'twitter.com' && media}
				<a class="twitterContain" href={media.oembed.url} target="_blank">
					<img
						src={preview ? preview.images[0].source.url : profilePreview}
						alt="twitter profile"
					/>
					{@html media.oembed.html.replace('&mdash; ', '')}
				</a>
			{:else if selftext_html}
				<div class="selftextContain">
					{@html selftext_html}
				</div>
			{/if}
		</div>

		<!-- Comment Logic -->
		{#if commentsVisible}
			{#await promise}
				<div
					class="loadingContainer"
					transition:slide={{ duration: 750, easing: cubicInOut }}
				>
					<div class="loadContent">
						<SpinLine size="40" color="var(--primary)" duration="4s" />
						<span>Loading comments...</span>
					</div>
				</div>
			{:then comments}
				<div class="commentsContainer" in:fly={{ y: 100 }} out:slide>
					{#each comments as comment}
						<Comment {...comment} submissionAuthor={author} />
					{/each}
				</div>
			{/await}
		{/if}
	</div>
</div>

<style lang="sass">
	:global(.lightMode)
		.card .text h1
			font-weight: 500

	.card
		position: relative
		display: flex
		width: 600px
		max-width: 100%
		max-height: 60vh
		flex-direction: column
		border-radius: 24px
		background: var(--background)
		border: 2px solid var(--neutral-40)
		overflow: hidden
		flex-shrink: 0
		transition: opacity .4s ease

		&.commentsVisible
			max-height: calc( 100vh - 120px )

		&.disabled
			opacity: 0

		:global(video)
			width: 100%
			height: 100%
			object-fit: contain

			&.lightbox
				position: fixed
				z-index: 999
				width: 90vw
				height: 90vh
				left: 5vw
				top: 5vh

		.nsfw
			filter: blur(80px)

		.nsfwOverlay
			position: absolute
			top: 0
			left: 0
			width: 100%
			height: 100%
			backdrop-filter: blur(80px)
			z-index: 4

			&.lightbox
				backdrop-filter: blur(0px)

		img
			width: auto
			max-width: 100%
			height: 100%
			cursor: pointer
			object-fit: contain
			z-index: 2

			&.linkImage
				object-fit: cover
				width: 100%

		.videoContain
			position: relative
			width: 100%
			height: 300px
			max-height: 300px
			display: block
			border-radius: 10px
			overflow: hidden
			background: var(--neutral-variant)

			&.nsfw
				filter: blur(0)

		:global(iframe)
			width: 100%
			height: 100%

		.imgContainer
			position: relative
			display: flex
			align-items: center
			justify-content: center
			border-radius: 10px
			height: 300px
			min-height: 300px
			overflow: hidden
			background: var(--neutral-variant)
			user-select: none

			a
				height: 100%

			span
				position: absolute
				top: 8px
				right: 8px
				z-index: 3
				background: var(--neutral-variant)
				color: var(--on-neutral-variant)
				padding: 8px 12px
				border-radius: 8px

			.backButton
				background: var(--primary)
				left: 24px
				top: calc( 50% - 24px )
				transform: none
				z-index: 3
				transition: transform .2s cubic-bezier(.57,.56,.29,3)

				&:active
					transform: scale(.95)

				&:last-of-type
					margin-left: 0
					right: 24px
					left: auto

				span
					position: relative
					background: none
					color: var(--background)
					padding: 0
					top: 0
					right: 0

		.selftextContain
			background: var(--neutral-variant)
			color: var(--on-neutral-variant)
			margin: 24px
			margin-top: 0
			padding: 24px
			border-radius: 16px
			font-weight: 200
			overflow: hidden

			:global(.md)
				display: flex
				flex-direction: column
				gap: 16px

			:global(p), :global(li)
				line-height: 20px
				opacity: .85
				overflow-wrap: break-word

				&:last-of-type
					margin: 0

			:global(li)
				margin-left: 24px !important
				margin-bottom: 16px

		.twitterContain
			position: relative
			text-decoration: none
			opacity: 1

			img
				width: 40px
				height: 40px
				position: absolute
				top: 24px
				left: 24px
				border-radius: 20px
				object-fit: cover

			:global(blockquote)
				display: flex
				flex-direction: column
				background: var(--neutral-variant)
				font-style: normal
				padding-left: 84px
				color: var(--on-background)

				:global(p)
					margin-top: 16px
					order: 2

	:global(blockquote)
		position: relative
		padding: 24px
		border-radius: 16px
		overflow: hidden
		font-style: italic

		:global(p)
			line-height: 24px

		&::before
			content: ''
			width: 100%
			height: 100%
			position: absolute
			top: 0
			left: 0
			background: var(--background)
			opacity: .25

	.scrollContainer
		height: 100%
		overflow: auto

	.text
		padding: 24px
		padding-bottom: 0px
		cursor: pointer
		transition: margin .4s ease-in-out

		&.commentsVisible
			margin-left: 68px

		.metaInfo
			font-size: 14px
			line-height: 20px
			letter-spacing: 0.1px
			display: flex
			align-items: center
			flex-flow: wrap
			font-weight: 300
			margin-bottom: 4px
			white-space: nowrap

			&>*
				margin-right: 8px

			.subreddit
				cursor: pointer

				&:hover
					color: var(--primary)

			.postDate, .postAuthor p
				opacity: .4

			.postAuthor
				display: flex
				align-items: center
				gap: 8px

				.flair
					margin: 0
					padding: 2px 12px
					background: var(--neutral-variant)
					color: var(--on-neutral-variant)

		h1
			font-weight: 300
			font-size: 22px
			line-height: 28px

	.buttons
		padding: 16px 24px
		padding-bottom: 24px
		display: flex
		gap: 8px

	.backButton
		width: 48px
		height: 48px
		min-height: 48px
		position: absolute
		top: 24px
		left: 24px
		background: var(--primary-container)
		color: var(--on-primary-container)
		border-radius: 24px
		display: flex
		align-items: center
		justify-content: center
		cursor: pointer
		z-index: 9
		transition: transform .2s ease

		&:active
			transform: scale(.9)

	.commentsContainer
		padding: 24px
		padding-top: 0
		overflow-x: hidden

	.flair
		font-size: 11px
		line-height: 14px
		letter-spacing: 0.1px
		background: var(--primary)
		color: var(--background)
		padding: 8px 16px
		border-radius: 20px
		display: flex
		align-items: center
		justify-content: center
		white-space: nowrap
		margin-left: 24px
		margin-top: 8px
		width: max-content

		img
			width: 20px
			height: 20px
			order: 1

		span
			margin-left: 8px
			order: 2

			& ~ img
				margin-left: -4px

			&:only-child
				margin: 0

	#galleryContainer
		overflow: hidden
		scroll-snap-type: x mandatory
		justify-content: flex-start
		width: 100%

	@media (min-width: 1560px)
		.card.disabled
				opacity: .25
				filter: blur(16px)
				z-index: -1

	@media (max-width: 900px)
		.card
			width: 100%
			max-height: none
			transition: all .4s ease
			border: 0
			border-bottom: 1px solid var(--neutral-40)
			border-radius: 0

			.text
				padding: 16px
				padding-bottom: 0

				h1
					font-size: 18px
					line-height: 24px

			.flair
				margin-left: 16px

			.buttons
				padding: 16px
				padding-top: 8px

			.metaInfo
				font-size: 12px

			&.commentsVisible
				width: 100%
				margin-top: 0
				max-height: 100vh
				border-radius: 0
				border: 0px solid rgba(0, 0, 0, 0)

				.selftextContain
					max-height: none

			.imgContainer, .videoContain, #galleryContainer
				height: 200px
				min-height: 200px
				width: auto
				margin: 16px
				z-index: 1
				margin-top: 0

			.twitterContain
				font-size: 14px

				:global(img)
					left: 38px !important

				:global(blockquote)
					margin: 16px
					margin-top: 0

			.selftextContain
				padding: 16px
				margin: 16px
				margin-top: 0
				max-height: 200px
				overflow: hidden

				:global(p)
					font-size: 14px

			.backButton
				left: 16px
				top: 16px

		.commentsContainer
			padding: 16px
			padding-top: 0
</style>
