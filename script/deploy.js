async function main() {
  const GamblingMarket = await ethers.getContractFactory("GamblingMarket");
  const contract = await GamblingMarket.deploy();

  await contract.waitForDeployment(); // chờ deploy xong

  const deployedAddress = await contract.getAddress(); // <-- dùng getAddress()

  console.log("GamblingMarket deployed to:", deployedAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
