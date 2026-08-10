# Optical sync

UStudy uses an animated, fountain-coded QR stream to transfer a selected local
backup from a laptop to a phone without a server connection.

The transport primitives in `vendor/decimen` are adapted from
`decimen-optical-transfer` and remain under the MIT license included at
`vendor/decimen/LICENSE`.

Source: https://github.com/bashalarmistalt/decimen-optical-transfer

UStudy owns the surrounding application flow:

- selected-data payload construction;
- gzip payload preparation;
- camera capture and QR decoding;
- existing import preview, per-group selection, local encryption, and rollback.

Transport code must not write to local storage directly. A received payload is
only handed to the normal import flow after its fountain checksum, file hash,
and file hash checks have all passed.
