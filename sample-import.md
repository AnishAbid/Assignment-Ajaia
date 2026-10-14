# Sample import

This file is safe to upload from the dashboard (**Upload .txt / .md**).

It should become a new document titled **sample-import**, with:

- a heading
- **bold** and *italic* text
- a list

- first item
- second item

The next line is hostile markup and must **not** execute after import:

<script>alert("xss")</script>

If the sanitizer is doing its job, you will not see a script tag in the editor.
