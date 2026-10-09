import React from "react";
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

import type { TemplateEntry } from "./registry";

interface Props {
  reference?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  service?: string;
  frequency?: string;
  serviceDate?: string;
  arrivalWindow?: string;
  address?: string;
  total?: string;
}

const serviceLabels: Record<string, string> = {
  standard: "Standard cleaning",
  deep: "Deep cleaning",
  move: "Move-in / move-out cleaning",
};

const windowLabels: Record<string, string> = {
  morning: "8:00 AM - 11:00 AM",
  midday: "11:00 AM - 2:00 PM",
  afternoon: "2:00 PM - 5:00 PM",
};

const Email = ({
  reference,
  customerName,
  customerEmail,
  customerPhone,
  service,
  frequency,
  serviceDate,
  arrivalWindow,
  address,
  total,
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{`Paid booking ${reference ?? ""} - ${customerName ?? "customer"}`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={heading}>New paid booking</Heading>
        <Text style={paragraph}>
          A customer paid in full and booked an appointment through heytlcleaning.com.
        </Text>
        <Section style={card}>
          <Text style={row}>
            <strong>Reference:</strong> {reference ?? "-"}
          </Text>
          <Text style={row}>
            <strong>Customer:</strong> {customerName ?? "-"}
          </Text>
          <Text style={row}>
            <strong>Email:</strong> {customerEmail ?? "-"}
          </Text>
          <Text style={row}>
            <strong>Phone:</strong> {customerPhone ?? "-"}
          </Text>
          <Hr style={divider} />
          <Text style={row}>
            <strong>Service:</strong> {serviceLabels[service ?? ""] ?? service ?? "-"}
          </Text>
          <Text style={row}>
            <strong>Frequency:</strong> {frequency ?? "One-time"}
          </Text>
          <Text style={row}>
            <strong>Date:</strong> {serviceDate ?? "-"}
          </Text>
          <Text style={row}>
            <strong>Arrival window:</strong> {windowLabels[arrivalWindow ?? ""] ?? arrivalWindow ?? "-"}
          </Text>
          <Text style={row}>
            <strong>Address:</strong> {address ?? "-"}
          </Text>
          <Hr style={divider} />
          <Text style={row}>
            <strong>Paid in full:</strong> {total ?? "-"}
          </Text>
        </Section>
        <Text style={muted}>
          Full details, private notes, and status updates are in your owner dashboard.
        </Text>
      </Container>
    </Body>
  </Html>
);

export const template = {
  component: Email,
  subject: "New paid booking - Tranquility Level Cleaning",
  displayName: "Paid booking notification",
  previewData: {
    reference: "TLC-AB12CD34",
    customerName: "Jane Doe",
    customerEmail: "jane@example.com",
    customerPhone: "(214) 555-0100",
    service: "standard",
    frequency: "One-time",
    serviceDate: "2026-10-05",
    arrivalWindow: "morning",
    address: "123 Main St, Euless, TX 76039",
    total: "$145.00",
  },
} satisfies TemplateEntry;

const main = { backgroundColor: "#ffffff", fontFamily: "Arial, sans-serif" };
const container = { padding: "20px 25px" };
const heading = { color: "#252927", fontSize: "22px", margin: "0 0 12px" };
const paragraph = { color: "#252927", fontSize: "14px", lineHeight: "1.55" };
const card = {
  backgroundColor: "#fbfaf7",
  border: "1px solid #e7e2d8",
  borderRadius: "10px",
  padding: "16px 18px",
  margin: "16px 0",
};
const row = { color: "#252927", fontSize: "14px", lineHeight: "1.55", margin: "4px 0" };
const divider = { borderColor: "#e7e2d8", margin: "10px 0" };
const muted = { color: "#626b67", fontSize: "12px", lineHeight: "1.5" };
