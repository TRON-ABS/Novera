# Novera roadmap

Novera aims to make knowledge and useful AI capabilities accessible across languages, devices and levels of technical experience. This roadmap describes the project direction, not a set of announced release dates or completed features.

## Current source baseline

- Novera product identity and dedicated source repository.
- Local and cloud model integrations inherited from Jan.
- MCP tools, document retrieval and assistant workflows in the source foundation.
- 36 interface locale options, with [measured coverage and explicit translation limits](docs/LANGUAGES.md).

No Novera binary has been released. Builds are on hold; source integration does not establish runtime readiness.

## 1. Consolidate the foundation

Verify the integrated experience, preserve user data, define a reviewed profile import path, and prepare Novera-specific packaging, signing and updates. Establish a clear set of supported environments and reproducible validation steps before distributing a first release.

## 2. Make model integrations easier to evolve

Separate model/provider capabilities and compatibility handling from conversation orchestration. Make it easier to add a new model or provider without changing unrelated application behavior. Validate capabilities explicitly instead of assuming a new model supports every existing tool or modality.

## 3. Explore new capabilities

Use an experimental channel for new tool integrations, agent workflows and multimodal capabilities. Promote experiments into the stable experience only when they are useful, understandable and sufficiently verified. Future model compatibility requires implementation and validation as those models become available.

## 4. Expand access to knowledge

Improve native-language review, accessibility, operation on modest hardware and options for limited connectivity. Explore educational workflows with teachers and learners before claiming readiness for schools.

## How priorities are chosen

Prioritize changes that remove a concrete obstacle to learning or everyday use, improve reliability, or make future integrations easier to maintain. Keep contributions focused and document their actual validation and remaining limits.

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidance.
