import { type ComponentType, Fragment, type ReactNode, type SVGProps } from 'react'
import CrownIcon from '~icons/lucide/crown'
import KeyIcon from '~icons/lucide/key'
import SlidersIcon from '~icons/lucide/sliders-horizontal'
import UserIcon from '~icons/lucide/user-round'
import WalletIcon from '~icons/lucide/wallet'
import { accountDiagram } from './AccountDiagram.styles'
import { docsIcons } from './DocsIcon'

/**
 * Icons the diagrams need beyond the shared docs set. `key` is a key the account owns (a root key
 * or a signer's private key); access keys keep the shared `accessKey` glyph.
 */
const extraIcons = {
  crown: CrownIcon,
  key: KeyIcon,
  sliders: SlidersIcon,
  user: UserIcon,
  wallet: WalletIcon,
}

type Glyph = keyof typeof docsIcons | keyof typeof extraIcons

const diagrams = {
  address: AccountAddress,
  signers: SignerApproval,
  'access-keys': AccessKeyBounds,
  'account-types': AccountTypes,
  'single-key': SingleKeyAccount,
  configurable: ConfigurableAccount,
  keychain: KeychainAuthority,
  treasury: TreasuryApproval,
  'rotate-signer': RotateSigner,
  login: LoginApproval,
}

/**
 * Account diagrams, drawn in HTML so they wrap at phone width and follow the docs theme. Icons mark
 * things (keys, accounts, addresses); attributes and conditions are plain text. The figure is one
 * image to assistive technology; `alt` carries the full description, and the Markdown export
 * renders `alt` in its place.
 */
export function AccountDiagram({ name, alt }: { name: keyof typeof diagrams; alt: string }) {
  const Diagram = diagrams[name]
  return (
    <figure
      className={`account-diagram ${accountDiagram().className}`}
      data-diagram={name}
      role="img"
      aria-label={alt}
    >
      <div className="ad-canvas">
        <Diagram />
      </div>
    </figure>
  )
}

function Icon({ name }: { name: Glyph }) {
  const Svg: ComponentType<SVGProps<SVGSVGElement>> =
    name in extraIcons
      ? extraIcons[name as keyof typeof extraIcons]
      : docsIcons[name as keyof typeof docsIcons]
  return (
    <Svg
      className="ad-icon"
      aria-hidden="true"
      focusable="false"
      width="16"
      height="16"
      strokeWidth="1.75"
    />
  )
}

/** A thing: an icon and a short label, with an optional weight or threshold. */
function Chip({
  icon,
  label,
  value,
  strong,
}: {
  icon: Glyph
  label: string
  value?: string
  strong?: boolean
}) {
  return (
    <span className={strong ? 'ad-chip ad-chip-strong' : 'ad-chip'}>
      <Icon name={icon} />
      {label}
      {value !== undefined && <span className="ad-value">{value}</span>}
    </span>
  )
}

/**
 * An arrow and the chip it points to, with the verb above the arrow and an optional note below.
 * They wrap together, so a line never ends on an arrow.
 */
function Then({ label, note, children }: { label?: string; note?: string; children: ReactNode }) {
  return (
    <span className="ad-then">
      <span className="ad-arrow">
        <span className="ad-arrow-label">{label}</span>
        <span className="ad-arrow-line">→</span>
        <span className="ad-arrow-label">{note}</span>
      </span>
      {children}
    </span>
  )
}

/** A titled box: the thing being described, with its parts inside. */
function Part({
  icon,
  title,
  tone,
  children,
}: {
  icon: Glyph
  title: string
  tone?: 'strong' | 'quiet'
  children: ReactNode
}) {
  return (
    <div className={tone ? `ad-part ad-part-${tone}` : 'ad-part'}>
      <div className="ad-part-head">
        <Icon name={icon} />
        {title}
      </div>
      {children}
    </div>
  )
}

/** Attribute rows: a label, with an optional detail aligned in a second column. */
function Fields({ rows }: { rows: ReadonlyArray<readonly [string, string?]> }) {
  return (
    <div className="ad-fields">
      {rows.map(([label, detail]) => (
        <Fragment key={label}>
          <span className="ad-field-label">{label}</span>
          <span className="ad-field-detail">{detail}</span>
        </Fragment>
      ))}
    </div>
  )
}

/** Signers with their weights, joining into the threshold they must reach. */
function Quorum({
  signers,
  threshold,
  caption,
}: {
  signers: ReadonlyArray<readonly [Glyph, string, string]>
  threshold: string
  caption: string
}) {
  return (
    <div className="ad-tree">
      <div className="ad-strip">
        {signers.map(([icon, label, weight]) => (
          <Chip key={label} icon={icon} label={label} value={weight} />
        ))}
      </div>
      <span className="ad-stem" />
      <Chip icon="threshold" label="Threshold" value={threshold} strong />
      <span className="ad-caption">{caption}</span>
    </div>
  )
}

function AccountAddress() {
  return (
    <Part icon="document" title="Address" tone="strong">
      <div className="ad-pair">
        <Part icon="user" title="Single-key account">
          <Fields rows={[['One key']]} />
        </Part>
        <span className="ad-or">or</span>
        <Part icon="sliders" title="Configurable account">
          <Fields rows={[['Signers, each with a weight'], ['Threshold']]} />
        </Part>
      </div>
      <div className="ad-shared">
        <span>Stablecoin balances</span>
        <span>Access keys</span>
        <span>Fee token</span>
      </div>
    </Part>
  )
}

function SignerApproval() {
  return (
    <Quorum
      signers={[
        ['passkey', 'Passkey', '2'],
        ['key', 'Backup key', '1'],
        ['key', 'Recovery key', '1'],
      ]}
      threshold="2"
      caption="Passkey alone, or both keys"
    />
  )
}

function TreasuryApproval() {
  return (
    <Quorum
      signers={[
        ['key', 'Finance key', '1'],
        ['key', 'Operations key', '1'],
        ['passkey', 'Controller passkey', '1'],
      ]}
      threshold="2"
      caption="Any two approve"
    />
  )
}

function AccessKeyBounds() {
  return (
    <div className="ad-variants">
      <Part icon="accessKey" title="Access key" tone="strong">
        <Fields
          rows={[
            ['Spending limit', 'Per stablecoin, once or per period'],
            ['Expiry', 'When it stops working'],
            ['Scopes', 'Contracts, functions, recipients'],
          ]}
        />
      </Part>
      <Part icon="crown" title="Admin access key" tone="quiet">
        <span className="ad-detail">No bounds. Manages other access keys.</span>
      </Part>
    </div>
  )
}

/** The lost passkey's weight moves to the new passkey; the two keys that remain approve the swap. */
function RotateSigner() {
  return (
    <div className="ad-ledger">
      <span className="ad-ledger-name">
        <Icon name="passkey" />
        <span className="ad-lost">Passkey</span>
        <span className="ad-arrow-line">→</span>
        New passkey
      </span>
      <span className="ad-ledger-weight">2</span>
      <span className="ad-ledger-note" />
      <span className="ad-ledger-name">
        <Icon name="key" />
        Backup key
      </span>
      <span className="ad-ledger-weight">1</span>
      <span className="ad-ledger-note">approves</span>
      <span className="ad-ledger-name">
        <Icon name="key" />
        Recovery key
      </span>
      <span className="ad-ledger-weight">1</span>
      <span className="ad-ledger-note">approves</span>
      <span className="ad-ledger-rule" />
      <span className="ad-ledger-name ad-ledger-total">
        <Icon name="threshold" />
        Threshold
      </span>
      <span className="ad-ledger-weight ad-ledger-total">2</span>
      <span className="ad-ledger-note" />
    </div>
  )
}

function AccountTypes() {
  return (
    <div className="ad-stack ad-stack-fit">
      <div className="ad-strip">
        <Chip icon="user" label="Single-key account" />
        <Then label="upgrade" note="same address">
          <Chip icon="sliders" label="Configurable account" />
        </Then>
      </div>
      <div className="ad-bar">
        <Icon name="rules" />
        <span className="ad-bar-title">Account Keychain</span>
        <span className="ad-detail">access keys for both</span>
      </div>
    </div>
  )
}

function SingleKeyAccount() {
  return (
    <div className="ad-stack">
      <div className="ad-fan">
        <Chip icon="key" label="Root key" strong />
        <div className="ad-branches">
          <Then label="derives">
            <Chip icon="document" label="Address" />
          </Then>
          <Then label="authorizes">
            <Chip icon="accessKey" label="Access keys" />
          </Then>
        </div>
      </div>
      <div className="ad-strip">
        <Chip icon="user" label="Single-key account" />
        <Then label="upgrade" note="same address">
          <Chip icon="sliders" label="Configurable account" />
        </Then>
      </div>
    </div>
  )
}

function ConfigurableAccount() {
  return (
    <div className="ad-stack">
      <div className="ad-strip">
        <Chip icon="sliders" label="Owners, threshold, salt" />
        <Then label="derive">
          <Chip icon="document" label="Address" strong />
        </Then>
      </div>
      <div className="ad-strip">
        <Chip icon="team" label="Owner signatures" />
        <Then label="weights reach threshold">
          <Chip icon="approved" label="Executes" strong />
        </Then>
      </div>
    </div>
  )
}

/** A login approves with a key on the customer's device; its ID token reaches Tempo as a proof. */
function LoginApproval() {
  return (
    <div className="ad-strip">
      <Chip icon="device" label="Device key" strong />
      <Then label="named in">
        <Chip icon="login" label="ID token" />
      </Then>
      <Then label="becomes">
        <Chip icon="verified" label="Proof" />
      </Then>
      <Then label="checked by">
        <Chip icon="approved" label="Tempo" strong />
      </Then>
    </div>
  )
}

function KeychainAuthority() {
  return (
    <div className="ad-strip">
      <Chip icon="wallet" label="Account" />
      <Then label="authorizes">
        <Chip icon="accessKey" label="Access key" strong />
      </Then>
      <Then label="signs within">
        <span className="ad-group">
          <span className="ad-tag">Spending limits</span>
          <span className="ad-tag">Expiry</span>
          <span className="ad-tag">Scopes</span>
        </span>
      </Then>
    </div>
  )
}
