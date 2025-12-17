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

<div class="container">
	<header>
		<h1>Sürücü Kursu Kasa Takip</h1>
	</header>

	<main>
		<div class="grid">
			<!-- Input Section -->
			<div class="card input-group">
				<h2>Girişler</h2>

				<div class="field">
					<label for="ziraat">ZİRAAT</label>
					<input
						type="number"
						id="ziraat"
						bind:value={ziraat}
						placeholder="0"
						class="input-money"
					/>
				</div>

				<div class="field">
					<label for="isBankasi">İŞ BANKASI</label>
					<input
						type="number"
						id="isBankasi"
						bind:value={isBankasi}
						placeholder="0"
						class="input-money"
					/>
				</div>

				<div class="field">
					<label for="garanti">GARANTİ</label>
					<input
						type="number"
						id="garanti"
						bind:value={garanti}
						placeholder="0"
						class="input-money"
					/>
				</div>

				<div class="field">
					<label for="nakit">NAKİT PARA</label>
					<input
						type="number"
						id="nakit"
						bind:value={nakit}
						placeholder="0"
						class="input-money highlight-yellow"
					/>
				</div>

				<div class="result-row mt-4">
					<span class="label">TOPLAM PARA</span>
					<span class="value large red-text">{formatCurrency(toplamKasa)}</span>
				</div>
			</div>

			<!-- Golden Section -->
			<div class="card erp-group">
				<h2>Golden</h2>
				<div class="field">
					<label for="kasa">KASA</label>
					<input
						type="number"
						id="kasa"
						bind:value={kasa}
						placeholder="0"
						class="input-money input-red-text"
					/>
				</div>

				<!-- Difference Result -->
				<div class="result-row mt-4">
					<span class="label">KASA EKSİK-FAZLA</span>
					<span
						class="value large"
						class:positive={kasaEksikFazla >= 0}
						class:negative={kasaEksikFazla < 0}
					>
						{formatCurrency(kasaEksikFazla)}
					</span>
					{#if kasaEksikFazla > 0}
						<span class="note positive-note">
							Elimizdeki para Golden'dan {formatCurrency(Math.abs(kasaEksikFazla))} TL daha fazla!
						</span>
					{:else if kasaEksikFazla < 0}
						<span class="note negative-note">
							Elimizdeki para Golden'dan {formatCurrency(Math.abs(kasaEksikFazla))} TL daha az!
						</span>
					{/if}
				</div>

				<!-- Save Button -->
				<div class="actions mt-4">
					<button class="btn-save" onclick={saveSession} disabled={loading}>
						{#if loading}
							Kaydediliyor...
						{:else}
							KAYDET
						{/if}
					</button>
				</div>
			</div>
		</div>

		<!-- History Section -->
		<div class="history-section mt-8">
			<h2>Geçmiş Kayıtlar</h2>
			<div class="table-container">
				<table>
					<thead>
						<tr>
							<th>Tarih</th>
							<th>Ziraat</th>
							<th>İş Bankası</th>
							<th>Garanti</th>
							<th>Nakit</th>
							<th>Kasa</th>
							<th>Fark</th>
						</tr>
					</thead>
					<tbody>
						{#each sessions as session}
							<tr>
								<td>{formatDate(session.created_at)}</td>
								<td>{formatCurrency(session.ziraat)}</td>
								<td>{formatCurrency(session.is_bankasi)}</td>
								<td>{formatCurrency(session.garanti)}</td>
								<td>{formatCurrency(session.nakit)}</td>
								<td>{formatCurrency(session.kasa)}</td>
								<td
									class:text-green={session.difference >= 0}
									class:text-red={session.difference < 0}
								>
									{formatCurrency(session.difference)}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</main>
</div>

<style>
	:global(body) {
		margin: 0;
		font-family:
			'Segoe UI',
			system-ui,
			-apple-system,
			sans-serif;
		background-color: #f0f2f5;
		color: #333;
		font-size: 0.9rem; /* Smaller base font */
	}

	.note {
		margin-top: 0.5rem;
		font-size: 0.9rem;
		font-weight: 500;
	}

	.positive-note {
		color: #16a34a;
	}

	.negative-note {
		color: #dc2626;
	}

	.container {
		max-width: 900px; /* Slightly wider for table */
		margin: 0 auto;
		padding: 1rem; /* Reduced padding */
	}

	header {
		text-align: center;
		margin-bottom: 1rem;
	}

	h1 {
		font-size: 1.8rem; /* Smaller header */
		color: #2c3e50;
		margin: 0;
	}

	h2 {
		font-size: 1.1rem;
		margin-bottom: 1rem;
		color: #555;
		border-bottom: 1px solid #eee;
		padding-bottom: 0.25rem;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 1rem;
	}

	.card {
		background: white;
		padding: 1.5rem; /* Reduced padding */
		border-radius: 8px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
	}

	.field {
		margin-bottom: 1rem;
	}

	label {
		display: block;
		font-weight: 600;
		margin-bottom: 0.25rem;
		font-size: 0.9rem;
		color: #444;
	}

	input.input-money {
		width: 100%;
		padding: 0.5rem; /* Smaller padding */
		font-size: 1.2rem; /* Smaller font */
		border: 1px solid #ddd;
		border-radius: 6px;
		transition: border-color 0.2s;
		box-sizing: border-box;
	}

	input.input-money:focus {
		border-color: #3b82f6;
		outline: none;
	}

	input.highlight-yellow {
		background-color: #fffae6;
	}

	input.input-red-text {
		color: #dc2626;
		font-weight: bold;
	}

	.result-row {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		padding: 0.75rem;
		background-color: #fafafa;
		border-radius: 6px;
	}

	.mt-4 {
		margin-top: 1rem;
	}

	.mt-8 {
		margin-top: 2rem;
	}

	.result-row .label {
		font-weight: bold;
		font-size: 1rem;
		color: #666;
	}

	.result-row .value {
		font-size: 1.8rem; /* Smaller result font */
		font-weight: 800;
		margin-top: 0.25rem;
		line-height: 1.2;
	}

	.red-text {
		color: #dc2626;
	}

	.positive {
		color: #16a34a;
	}

	.negative {
		color: #dc2626;
	}

	/* Button Styles */
	.btn-save {
		width: 100%;
		padding: 0.75rem;
		background-color: #3b82f6;
		color: white;
		border: none;
		border-radius: 6px;
		font-size: 1.1rem;
		font-weight: bold;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.btn-save:hover {
		background-color: #2563eb;
	}

	.btn-save:disabled {
		background-color: #93c5fd;
		cursor: not-allowed;
	}

	/* Table Styles */
	.history-section {
		background: white;
		padding: 1.5rem;
		border-radius: 8px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
	}

	.table-container {
		overflow-x: auto;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.9rem;
	}

	th,
	td {
		text-align: right;
		padding: 0.75rem;
		border-bottom: 1px solid #eee;
	}

	th {
		text-align: right;
		font-weight: 600;
		color: #555;
		background-color: #f9fafb;
	}

	th:first-child,
	td:first-child {
		text-align: left;
	}

	.text-green {
		color: #16a34a;
		font-weight: 600;
	}

	.text-red {
		color: #dc2626;
		font-weight: 600;
	}
</style>
