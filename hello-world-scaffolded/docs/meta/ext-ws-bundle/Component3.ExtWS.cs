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
    namespace Component3 {
        [ServiceContract]
        public interface Component3 {
            [OperationContract]
            [FaultContractAttribute(typeof(DomainFault))]
             void ExampleMethod();
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