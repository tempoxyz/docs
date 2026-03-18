// [!region setup]
use alloy::providers::ProviderBuilder;
use alloy::signers::local::PrivateKeySigner;
use tempo_alloy::TempoNetwork;

pub async fn get_provider() -> Result<
    impl alloy::providers::Provider<TempoNetwork>,
    Box<dyn std::error::Error>,
> {
    let signer: PrivateKeySigner = std::env::var("PRIVATE_KEY")
        .expect("PRIVATE_KEY not set")
        .parse()?;

    let provider = ProviderBuilder::new_with_network::<TempoNetwork>()
        .wallet(signer)
        .connect(&std::env::var("RPC_URL").expect("RPC_URL not set"))
        .await?;

    Ok(provider)
}
// [!endregion setup]
