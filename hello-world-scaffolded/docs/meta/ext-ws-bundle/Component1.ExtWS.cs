using System;
using System.Collections.Generic;
using System.Runtime.Serialization;
using System.ServiceModel;
namespace DomainBellaNS.API {
    [DataContract]
    public enum DomainError {
        [EnumMember]
         DomainError = 1
    }
    namespace Echo1 {
        [ServiceContract]
        public interface Echo1 {
            [OperationContract]
            [FaultContractAttribute(typeof(DomainFault))]
             void DoEcho1();
        }
    }
    namespace Echo2 {
        [ServiceContract]
        public interface Echo2 {
            [OperationContract]
            [FaultContractAttribute(typeof(DomainFault))]
             void DoEcho2();
        }
    }
    [DataContractAttribute]
    public class DomainFault {
        [DataMemberAttribute]
        public DomainError Code;
        [DataMemberAttribute]
        public string Message;
    }

}