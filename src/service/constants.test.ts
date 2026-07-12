import { describe, expect, it } from "vitest";
import { availableServices } from "./constants";

describe("availableServices", () => {
  it("does not include retired service shortcuts", () => {
    expect(availableServices.map((service) => service.name)).not.toContain("Cloud Debugger");
    expect(availableServices.map((service) => service.name)).not.toContain("Source Repositories");
  });

  it("uses Infrastructure Manager instead of Deployment Manager", () => {
    expect(availableServices).toContainEqual({
      name: "Infrastructure Manager",
      category: "DevOps",
      url: "https://console.cloud.google.com/infra-manager",
    });
    expect(availableServices.map((service) => service.name)).not.toContain("Deployment Manager");
  });
});
