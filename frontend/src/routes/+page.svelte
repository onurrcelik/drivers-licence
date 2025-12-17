<script lang="ts">
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabase';

	let ziraat: number | null = $state(null);
	let isBankasi: number | null = $state(null);
	let garanti: number | null = $state(null);
	let nakit: number | null = $state(null);
	let kasa: number | null = $state(null);

	let toplamKasa = $derived((ziraat ?? 0) + (isBankasi ?? 0) + (garanti ?? 0) + (nakit ?? 0));
	let kasaEksikFazla = $derived(toplamKasa - (kasa ?? 0));

	let sessions: any[] = $state([]);
	let loading = $state(false);

	const loadSession = (session: any) => {
		ziraat = session.ziraat;
		isBankasi = session.is_bankasi;
		garanti = session.garanti;
		nakit = session.nakit;
		kasa = session.kasa;
	};

	// Function to format currency
	const formatCurrency = (val: number) => {
		return new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 0 }).format(val);
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleString('tr-TR', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	};

	const fetchSessions = async () => {
		const { data, error } = await supabase
			.from('sessions')
			.select('*')
			.order('created_at', { ascending: false });

		if (error) console.error('Error fetching sessions:', error);
		else sessions = data || [];
	};

	const saveSession = async () => {
		loading = true;
		const { error } = await supabase.from('sessions').insert({
			ziraat: ziraat ?? 0,
			is_bankasi: isBankasi ?? 0,
			garanti: garanti ?? 0,
			nakit: nakit ?? 0,
			kasa: kasa ?? 0
		});

		if (error) {
			alert('Kayıt başarısız: ' + error.message);
		} else {
			// alert('Başarıyla kaydedildi!');
			await fetchSessions();
		}
		loading = false;
	};

	onMount(() => {
		fetchSessions();
	});
</script>

<div class="app-layout">
	<!-- Sidebar (Gemini Style) -->
	<aside class="sidebar">
		<div class="sidebar-header">
			<button class="new-chat-btn" onclick={() => window.location.reload()}>
				<span class="plus-icon">+</span> Yeni Gün
			</button>
		</div>

		<div class="history-list">
			<h3>Geçmiş Kayıtlar</h3>
			{#if sessions.length === 0}
				<p class="empty-state">Henüz kayıt yok.</p>
			{/if}
			{#each sessions as session}
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div class="history-item" onclick={() => loadSession(session)}>
					<div class="history-date">{formatDate(session.created_at)}</div>
					<div
						class="history-diff"
						class:text-red={session.difference !== 0}
						class:text-green={session.difference === 0}
					>
						{#if session.difference > 0}
							Golden Fazla {formatCurrency(session.difference)} ₺
						{:else if session.difference < 0}
							Golden Eksik {formatCurrency(session.difference)} ₺
						{:else}
							Tam Denk
						{/if}
					</div>
				</div>
			{/each}
		</div>
	</aside>

	<!-- Main Content -->
	<main class="main-content">
		<header class="main-header">
			<div class="header-content">
				<h1>Levent Anadolu Sürücü Kursu</h1>
				<p class="subtitle">Kasa Takip Sistemi</p>
			</div>
		</header>

		<div class="dashboard-grid">
			<!-- Input Section -->
			<div class="card input-card">
				<div class="card-header">
					<h2>💵 Mevcut Para</h2>
				</div>
				<div class="card-body">
					<div class="input-grid">
						<div class="field">
							<label for="ziraat" class="bank-label ziraat">
								<span class="dot red"></span> ZİRAAT
							</label>
							<input
								type="number"
								id="ziraat"
								bind:value={ziraat}
								placeholder="0"
								class="input-money"
							/>
						</div>

						<div class="field">
							<label for="isBankasi" class="bank-label is-bank">
								<span class="dot blue"></span> İŞ BANKASI
							</label>
							<input
								type="number"
								id="isBankasi"
								bind:value={isBankasi}
								placeholder="0"
								class="input-money"
							/>
						</div>

						<div class="field">
							<label for="garanti" class="bank-label garanti">
								<span class="dot green"></span> GARANTİ
							</label>
							<input
								type="number"
								id="garanti"
								bind:value={garanti}
								placeholder="0"
								class="input-money"
							/>
						</div>

						<div class="field">
							<label for="nakit" class="bank-label nakit">
								<span class="dot yellow"></span> NAKİT PARA
							</label>
							<input
								type="number"
								id="nakit"
								bind:value={nakit}
								placeholder="0"
								class="input-money highlight-yellow"
							/>
						</div>
					</div>

					<div class="summary-box total-box">
						<span class="label">TOPLAM PARA</span>
						<span class="value">{formatCurrency(toplamKasa)} ₺</span>
					</div>
				</div>
			</div>

			<!-- Golden Section -->
			<div class="card erp-card">
				<div class="card-header">
					<h2>🏆 Golden</h2>
				</div>
				<div class="card-body">
					<div class="field">
						<label for="kasa">GOLDEN KASA</label>
						<input
							type="number"
							id="kasa"
							bind:value={kasa}
							placeholder="0"
							class="input-money input-kasa"
						/>
					</div>

					<!-- Difference Result -->
					<div class="summary-box difference-box">
						<span class="label">KASA EKSİK / FAZLA</span>
						<span
							class="value large"
							class:text-red={kasaEksikFazla !== 0}
							class:text-green={kasaEksikFazla === 0}
						>
							{formatCurrency(kasaEksikFazla)} ₺
						</span>

						{#if kasaEksikFazla !== 0}
							<!-- Both surplus and deficit are RED now (warning) -->
							<div class="status-badge danger">
								<span class="icon">⚠️</span>
								{#if kasaEksikFazla > 0}
									<span
										>Golden'dan <strong>{formatCurrency(Math.abs(kasaEksikFazla))} TL</strong> fazlayız</span
									>
								{:else}
									<span
										>Golden'dan <strong>{formatCurrency(Math.abs(kasaEksikFazla))} TL</strong> eksiğiz</span
									>
								{/if}
							</div>
						{:else}
							<!-- Only exact match is GREEN -->
							<div class="status-badge success">
								<span class="icon">✅</span>
								<span>Kasa tam denk!</span>
							</div>
						{/if}
					</div>

					<!-- Save Button -->
					<div class="actions">
						<button class="btn-save" onclick={saveSession} disabled={loading}>
							{#if loading}
								<span class="loader"></span> Kaydediliyor...
							{:else}
								KAYDET
							{/if}
						</button>
					</div>
				</div>
			</div>
		</div>
	</main>
</div>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

	:global(body) {
		margin: 0;
		font-family: 'Inter', sans-serif;
		background-color: #f8f9fa;
		color: #1f2937;
		-webkit-font-smoothing: antialiased;
		height: 100vh;
		overflow: hidden; /* Prevent body scroll, layout handles it */
	}

	.app-layout {
		display: flex;
		height: 100vh;
		width: 100vw;
	}

	/* Sidebar Styling */
	.sidebar {
		width: 280px;
		background-color: #f0f4f9; /* Gemini-ish sidebar color */
		border-right: 1px solid #e5e7eb;
		display: flex;
		flex-direction: column;
		padding: 1rem;
		flex-shrink: 0;
		overflow-y: auto;
	}

	.sidebar-header {
		margin-bottom: 2rem;
	}

	.new-chat-btn {
		background: #dde3ea;
		color: #1f1f1f;
		border: none;
		border-radius: 20px;
		padding: 10px 20px;
		font-size: 0.9rem;
		font-weight: 500;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 8px;
		transition: background 0.2s;
		width: 140px;
	}

	.new-chat-btn:hover {
		background: #ced5de;
	}

	.plus-icon {
		font-size: 1.2rem;
		line-height: 1;
	}

	.history-list h3 {
		font-size: 0.85rem;
		font-weight: 600;
		color: #444746;
		margin-bottom: 1rem;
		padding-left: 0.5rem;
	}

	.empty-state {
		padding-left: 0.5rem;
		color: #757575;
		font-size: 0.9rem;
	}

	.history-item {
		padding: 10px 15px;
		border-radius: 20px;
		cursor: pointer;
		display: flex;
		flex-direction: column;
		gap: 2px;
		transition: background 0.1s;
		margin-bottom: 0.25rem;
	}

	.history-item:hover {
		background-color: #e0e5eb;
	}

	.history-date {
		font-size: 0.85rem;
		color: #1f1f1f;
		font-weight: 500;
	}

	.history-diff {
		font-size: 0.8rem;
		font-weight: 600;
	}

	/* Main Content Styling */
	.main-content {
		flex: 1;
		padding: 2rem;
		overflow-y: auto;
		background-color: #ffffff;
	}

	.main-header {
		text-align: center;
		margin-bottom: 3rem;
		margin-top: 1rem;
	}

	.header-content h1 {
		font-size: 1.75rem;
		font-weight: 800;
		color: #1f1f1f;
		margin: 0;
		letter-spacing: -0.02em;
	}

	.subtitle {
		color: #444746;
		font-size: 1rem;
		margin-top: 0.25rem;
		font-weight: 500;
		opacity: 0.7;
	}

	.dashboard-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
		gap: 2rem;
		max-width: 1000px;
		margin: 0 auto;
	}

	/* Card Styling (kept similar but cleaner for white bg) */
	.card {
		background: #f8f9fa; /* Slightly off-white card on white bg */
		border-radius: 16px;
		padding: 1.5rem;
		/* box-shadow: none; Flat look closer to generic material */
		border: 1px solid #e0e0e0;
	}

	.card-header h2 {
		margin: 0 0 1.5rem 0;
		font-size: 1.1rem;
		font-weight: 600;
		color: #444;
	}

	/* Input Fields */
	.input-grid {
		display: grid;
		gap: 1.25rem;
	}

	.field {
		display: flex;
		flex-direction: column;
	}

	.bank-label {
		font-size: 0.8rem;
		font-weight: 600;
		color: #555;
		margin-bottom: 0.4rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		display: inline-block;
	}
	.dot.red {
		background-color: #e63946;
	}
	.dot.blue {
		background-color: #1e3a8a;
	}
	.dot.green {
		background-color: #2a9d8f;
	}
	.dot.yellow {
		background-color: #fca311;
	}

	.input-money {
		width: 100%;
		padding: 0.8rem;
		font-size: 1.1rem;
		font-family: 'Inter', monospace;
		border: 1px solid #c4c7c5;
		border-radius: 8px;
		background-color: white;
		transition: all 0.2s;
		color: #1f1f1f;
		box-sizing: border-box;
	}

	.input-money:focus {
		border-color: #0b57d0; /* Google blue-ish */
		outline: 2px solid rgba(11, 87, 208, 0.2);
	}

	.input-money.highlight-yellow {
		background-color: #fff8e1;
		border-color: #ffeb3b;
	}

	.input-kasa {
		font-size: 1.4rem;
		text-align: center;
	}

	/* Summaries */
	.summary-box {
		margin-top: 1.5rem;
		background: white;
		border-radius: 12px;
		padding: 1.25rem;
		text-align: center;
		border: 1px solid #e0e0e0;
	}

	.summary-box .label {
		display: block;
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: #666;
		margin-bottom: 0.25rem;
	}

	.summary-box .value {
		font-size: 1.8rem;
		font-weight: 700;
		color: #1f1f1f;
	}

	/* Colors */
	.text-green {
		color: #146c2e;
	} /* Stronger green */
	.text-red {
		color: #b3261e;
	} /* Material error red */

	.status-badge {
		margin-top: 1rem;
		padding: 0.8rem;
		border-radius: 8px;
		font-size: 0.9rem;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
	}

	.status-badge.success {
		background-color: #e6f4ea;
		color: #137333;
	}

	.status-badge.danger {
		background-color: #fce8e6;
		color: #c5221f;
	}

	/* Button */
	.actions {
		margin-top: 2rem;
	}

	.btn-save {
		width: 100%;
		padding: 1rem;
		background: #0b57d0; /* Gemini Blue */
		color: white;
		border: none;
		border-radius: 25px; /* Pill shape */
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-save:hover {
		background: #0842a0;
		box-shadow: 0 1px 3px 1px rgba(0, 0, 0, 0.15);
	}

	.btn-save:disabled {
		background: #e0e0e0;
		color: #999;
		cursor: not-allowed;
		box-shadow: none;
	}

	/* Loader */
	.loader {
		border: 2px solid #ffffff;
		border-top: 2px solid transparent;
		border-radius: 50%;
		width: 14px;
		height: 14px;
		animation: spin 1s linear infinite;
		display: inline-block;
		margin-right: 8px;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	/* Mobile Responsive */
	@media (max-width: 768px) {
		.app-layout {
			flex-direction: column;
		}

		.sidebar {
			width: 100%;
			height: auto;
			max-height: 200px;
			border-right: none;
			border-bottom: 1px solid #e5e7eb;
		}

		.main-content {
			overflow-y: scroll;
		}
	}
</style>
