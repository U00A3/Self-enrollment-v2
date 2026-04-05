// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MembershipRegistry
 * @author DAO
 *
 * @notice
 * On-chain registry of DAO members.
 *
 * - 1 address = 1 member
 * - region is declarative (stored as hash)
 * - no PII on-chain
 * - backend acts as policy layer (CAT, region caps)
 * - ready for future VC / verifierkit
 */
contract MembershipRegistry {
    /*//////////////////////////////////////////////////////////////
                                TYPES
    //////////////////////////////////////////////////////////////*/

    struct Member {
        bytes32 regionHash; // e.g. keccak256("EU"), keccak256("AF")
        bool active;
    }

    /*//////////////////////////////////////////////////////////////
                                STORAGE
    //////////////////////////////////////////////////////////////*/

    mapping(address => Member) private _members;
    mapping(bytes32 => uint256) private _regionCounts;

    uint256 private _totalMembers;

    address public backend; // trusted policy executor
    address public dao;     // multisig / governance

    /*//////////////////////////////////////////////////////////////
                                EVENTS
    //////////////////////////////////////////////////////////////*/

    event MemberJoined(address indexed user, bytes32 regionHash);
    event RegionDeclared(address indexed user, string region, string message);
    event MemberMigrated(address indexed oldAddress, address indexed newAddress);
    event MemberRevoked(address indexed user);
    event BackendUpdated(address indexed oldBackend, address indexed newBackend);
    event DAOUpdated(address indexed oldDAO, address indexed newDAO);

    /*//////////////////////////////////////////////////////////////
                                ERRORS
    //////////////////////////////////////////////////////////////*/

    error NotBackend();
    error NotDAO();
    error AlreadyMember();
    error NotMember();
    error InvalidAddress();

    /*//////////////////////////////////////////////////////////////
                                MODIFIERS
    //////////////////////////////////////////////////////////////*/

    modifier onlyBackend() {
        if (msg.sender != backend) revert NotBackend();
        _;
    }

    modifier onlyDAO() {
        if (msg.sender != dao) revert NotDAO();
        _;
    }

    /*//////////////////////////////////////////////////////////////
                                CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    constructor(address initialBackend, address initialDAO) {
        if (initialBackend == address(0) || initialDAO == address(0)) {
            revert InvalidAddress();
        }

        backend = initialBackend;
        dao = initialDAO;
    }

    /*//////////////////////////////////////////////////////////////
                            VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function isMember(address user) external view returns (bool) {
        return _members[user].active;
    }

    function getMember(address user)
        external
        view
        returns (bytes32 regionHash, bool active)
    {
        Member memory m = _members[user];
        return (m.regionHash, m.active);
    }

    function totalMembers() external view returns (uint256) {
        return _totalMembers;
    }

    function membersByRegion(bytes32 regionHash)
        external
        view
        returns (uint256)
    {
        return _regionCounts[regionHash];
    }

    /*//////////////////////////////////////////////////////////////
                        MEMBERSHIP MANAGEMENT
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Adds a new member.
     * @dev CAT, region cap, sybil protection are enforced OFF-CHAIN.
     * @param region Region code (e.g. "EU") – shown in explorer.
     * @param declarationMessage Signed text (e.g. "Akceptuję warunki regulaminu DAO.") – shown in explorer.
     */
    function join(address user, string calldata region, string calldata declarationMessage) external onlyBackend {
        if (user == address(0)) revert InvalidAddress();
        if (_members[user].active) revert AlreadyMember();

        bytes32 regionHash = keccak256(abi.encodePacked(region));

        _members[user] = Member({
            regionHash: regionHash,
            active: true
        });

        _regionCounts[regionHash] += 1;
        _totalMembers += 1;

        emit MemberJoined(user, regionHash);
        emit RegionDeclared(user, region, declarationMessage);
    }

    /**
     * @notice Migrates membership to a new address.
     * @dev Region stays unchanged. No cap impact.
     */
    function migrate(address oldAddress, address newAddress)
        external
        onlyBackend
    {
        if (newAddress == address(0)) revert InvalidAddress();
        if (!_members[oldAddress].active) revert NotMember();
        if (_members[newAddress].active) revert AlreadyMember();

        Member memory m = _members[oldAddress];

        _members[newAddress] = Member({
            regionHash: m.regionHash,
            active: true
        });

        _members[oldAddress].active = false;

        emit MemberMigrated(oldAddress, newAddress);
    }

    /**
     * @notice Self-exit: caller revokes their own membership.
     * @dev Callable by any member from the block explorer (Connect Wallet → Write → leave).
     */
    function leave() external {
        address user = msg.sender;
        if (!_members[user].active) revert NotMember();

        bytes32 regionHash = _members[user].regionHash;

        _members[user].active = false;
        _regionCounts[regionHash] -= 1;
        _totalMembers -= 1;

        emit MemberRevoked(user);
    }

    /**
     * @notice Revokes membership of an address (admin only).
     * @dev Callable only by dao (deployer). Use from block explorer with dao wallet.
     */
    function revoke(address user) external onlyDAO {
        if (!_members[user].active) revert NotMember();

        bytes32 regionHash = _members[user].regionHash;

        _members[user].active = false;
        _regionCounts[regionHash] -= 1;
        _totalMembers -= 1;

        emit MemberRevoked(user);
    }

    /*//////////////////////////////////////////////////////////////
                        ADMIN / GOVERNANCE
    //////////////////////////////////////////////////////////////*/

    function updateBackend(address newBackend) external onlyDAO {
        if (newBackend == address(0)) revert InvalidAddress();

        address old = backend;
        backend = newBackend;

        emit BackendUpdated(old, newBackend);
    }

    function updateDAO(address newDAO) external onlyDAO {
        if (newDAO == address(0)) revert InvalidAddress();

        address old = dao;
        dao = newDAO;

        emit DAOUpdated(old, newDAO);
    }
}
